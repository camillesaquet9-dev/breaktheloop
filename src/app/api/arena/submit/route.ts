import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/auth/supabase-server";
import { getChallenge } from "@/lib/challenges/catalog";
import { computeScore } from "@/lib/challenges/scoring";
import { validateAttempt } from "@/lib/challenges/validators";
import { callTarget } from "@/lib/llm/router";
import { hashIp, hashPayload, readClientIp } from "@/lib/security/ip-hash";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  slug: z.string().min(3).max(60),
  payload: z.string().min(1).max(8000),
  /** Required only for flag-extract challenges. */
  submittedFlag: z.string().max(200).optional(),
});

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });

  const challenge = getChallenge(parsed.data.slug);
  if (!challenge) return NextResponse.json({ error: "CHALLENGE_NOT_FOUND" }, { status: 404 });

  // Re-run the LLM call server-side so we score what *actually* came back,
  // not what the client claims.  Kept short — same provider chain as /probe.
  const llm = await callTarget(
    {
      system: challenge.systemPrompt,
      user: parsed.data.payload,
      maxOutputTokens: 600,
      temperature: 0.6,
    },
    challenge.providerHint,
  );

  const validation = await validateAttempt({
    challenge,
    payload: parsed.data.payload,
    response: llm.text,
    submittedFlag: parsed.data.submittedFlag,
  });

  // Compute attempt N for this user/challenge for scoring + persistence_penalty.
  const supabase = createSupabaseServiceClient();
  const { count } = await supabase
    .from("attempts")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("challenge_slug", challenge.slug);
  const attemptN = (count ?? 0) + 1;

  const score = validation.success
    ? computeScore({
        challenge,
        inputTokens: llm.inputTokens,
        attemptN,
      })
    : 0;

  const ip = readClientIp(request.headers);
  const insertData = {
    user_id: user.id,
    challenge_slug: challenge.slug,
    payload_hash: hashPayload(parsed.data.payload),
    input_tokens: llm.inputTokens,
    output_excerpt: llm.text.slice(0, 220),
    judges_votes: validation.judgesVotes ?? null,
    success: validation.success,
    score,
    ip_hash: hashIp(ip),
  };
  // biome-ignore lint/suspicious/noExplicitAny: supabase v2 generic typing hassle, schema enforced server-side
  await (supabase.from("attempts") as any).insert(insertData);

  return NextResponse.json({
    success: validation.success,
    reason: validation.reason,
    response: llm.text,
    score,
    inputTokens: llm.inputTokens,
    outputTokens: llm.outputTokens,
    provider: llm.provider,
    latencyMs: llm.latencyMs,
    judgesVotes: validation.judgesVotes ?? null,
    attemptN,
  });
}
