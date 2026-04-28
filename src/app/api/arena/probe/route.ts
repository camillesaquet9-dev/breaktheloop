import "server-only";

import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isGuestMode } from "@/lib/auth/guest-mode";
import { getSessionUser } from "@/lib/auth/supabase-server";
import { getChallenge } from "@/lib/challenges/catalog";
import { callTarget } from "@/lib/llm/router";
import { hashIp, readClientIp } from "@/lib/security/ip-hash";
import { getDailyUserLimiter, getProbeLimiter } from "@/lib/security/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  slug: z.string().min(3).max(60),
  payload: z.string().min(1).max(8000),
});

export async function POST(request: NextRequest) {
  const guest = isGuestMode();
  const user = await getSessionUser();
  if (!user && !guest) {
    return NextResponse.json({ error: "AUTH_REQUIRED" }, { status: 401 });
  }

  const parsed = bodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "BAD_REQUEST" }, { status: 400 });
  }

  const challenge = getChallenge(parsed.data.slug);
  if (!challenge) {
    return NextResponse.json({ error: "CHALLENGE_NOT_FOUND" }, { status: 404 });
  }

  // Length cap on payload — prevents using us as a free LLM proxy.
  // 4 chars/token average + 200 char safety margin.
  const approxTokens = Math.ceil(parsed.data.payload.length / 4);
  if (approxTokens > challenge.maxInputTokens) {
    return NextResponse.json({ error: "PAYLOAD_TOO_LONG" }, { status: 413 });
  }

  // Rate limit (probe-level, per challenge + IP).
  const ip = readClientIp(request.headers);
  const probeLimiter = getProbeLimiter();
  if (probeLimiter) {
    const r = await probeLimiter.limit(`${parsed.data.slug}:${ip}`);
    if (!r.success) {
      return NextResponse.json(
        {
          error: "RATE_LIMITED",
          retryAfterSeconds: Math.max(
            1,
            Math.ceil(r.reset / 1000) - Math.floor(Date.now() / 1000),
          ),
        },
        { status: 429 },
      );
    }
  }

  // Per-user daily cap (or per-IP daily cap in guest mode).
  const userLimiter = getDailyUserLimiter();
  if (userLimiter) {
    const limiterKey = user?.id ?? `guest:${ip}`;
    const r = await userLimiter.limit(limiterKey);
    if (!r.success) {
      return NextResponse.json({ error: "DAILY_QUOTA_REACHED" }, { status: 429 });
    }
  }

  try {
    const result = await callTarget(
      {
        system: challenge.systemPrompt,
        user: parsed.data.payload,
        maxOutputTokens: 600,
        temperature: 0.6,
      },
      challenge.providerHint,
    );

    return NextResponse.json({
      response: result.text,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      provider: result.provider,
      latencyMs: result.latencyMs,
      ipHash: hashIp(ip),
      guest,
    });
  } catch (err) {
    console.error("[arena/probe]", err);
    return NextResponse.json(
      { error: "PROVIDER_UNAVAILABLE", detail: (err as Error).message.slice(0, 120) },
      { status: 503 },
    );
  }
}
