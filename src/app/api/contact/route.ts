import { NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/contact/email";
import { handleContactSubmission } from "@/lib/contact/handler";
import { extractClientIp, hashIpWithSalt } from "@/lib/contact/ip-hash";
import { consumeContactRateLimit } from "@/lib/contact/rate-limit";
import { insertContactMessage } from "@/lib/contact/supabase-insert";
import { verifyTurnstileToken } from "@/lib/contact/turnstile";

/**
 * Thin adapter over `handleContactSubmission`.
 *
 * Every concrete side-effect implementation (Supabase, Resend, Upstash,
 * Cloudflare) is wired up here and passed to the pure handler. Unit tests
 * in src/lib/contact/handler.test.ts exercise the business logic with
 * stubs — this adapter is covered by an integration test only.
 *
 * Responses are intentionally generic so automated scanners can't fingerprint
 * which stage failed.
 */

// Force Node runtime — crypto.subtle + Upstash SDK + Resend all work on
// Edge, but Supabase's service_role client bundle is hefty and plays nicer
// on Node. We can revisit later.
export const runtime = "nodejs";

// No caching — each submission must go through the full pipeline.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let rawPayload: unknown;
  try {
    rawPayload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "validation" }, { status: 400 });
  }

  const ip = extractClientIp(request.headers);
  const userAgent = request.headers.get("user-agent");
  const referer = request.headers.get("referer");

  const result = await handleContactSubmission(
    { rawPayload, ip, userAgent, referer },
    {
      hashIp: hashIpWithSalt,
      consumeRateLimit: consumeContactRateLimit,
      verifyTurnstile: verifyTurnstileToken,
      insertMessage: insertContactMessage,
      sendEmail: sendContactEmail,
      requireTurnstile: process.env.NODE_ENV === "production",
    },
  );

  if (result.ok) {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // Map reason → HTTP status. We intentionally return 200 for honeypot so
  // automated bots think their fill worked, reducing retries.
  if (result.reason === "honeypot") {
    return NextResponse.json({ ok: true }, { status: 200 });
  }
  if (result.reason === "rate_limit") {
    return NextResponse.json(
      { ok: false, reason: "rate_limit" },
      { status: 429, headers: { "retry-after": "3600" } },
    );
  }
  if (result.reason === "turnstile") {
    return NextResponse.json({ ok: false, reason: "turnstile" }, { status: 403 });
  }
  if (result.reason === "validation") {
    return NextResponse.json({ ok: false, reason: "validation" }, { status: 400 });
  }
  // insert_failed / email_failed → 502 (we did our job, downstream didn't)
  return NextResponse.json({ ok: false, reason: result.reason }, { status: 502 });
}
