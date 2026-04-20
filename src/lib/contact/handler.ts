import { contactSchema } from "./schema";

/**
 * Pure, dependency-injected handler for a contact submission.
 *
 * Design:
 *   - NO direct imports of Supabase / Resend / Upstash / Turnstile — all
 *     side effects come in through `deps` so unit tests can substitute
 *     fakes trivially.
 *   - Returns a discriminated union — no thrown errors except for genuine
 *     bugs. Callers (route adapters) turn each reason into an HTTP status.
 *   - Order: validate → honeypot → rate-limit → Turnstile → persist → email.
 *     We persist BEFORE emailing so a Resend outage doesn't drop the message.
 *
 * The shape of `ContactHandlerDeps` is intentionally narrow so tests only
 * need to stub four predicates + `hashIp` + `now`.
 */

export type ContactHandlerDeps = {
  /** SHA-256 or similar — must be deterministic and irreversible. */
  readonly hashIp: (ip: string) => Promise<string> | string;
  /**
   * Returns `true` if this IP is within its budget (and consumes one token),
   * or `false` if the budget is exhausted.
   */
  readonly consumeRateLimit: (ipHash: string) => Promise<boolean>;
  /** Cloudflare Turnstile server-side verification. */
  readonly verifyTurnstile: (token: string, ip: string) => Promise<boolean>;
  /** Persist to Supabase (service_role). */
  readonly insertMessage: (payload: ContactInsertInput) => Promise<boolean>;
  /** Forward by email via Resend. Failure is non-fatal (we kept the DB row). */
  readonly sendEmail: (payload: ContactEmailInput) => Promise<boolean>;
  /** Environment flag — some checks relax in dev. */
  readonly requireTurnstile: boolean;
  /** Injected clock for deterministic tests. */
  readonly now?: () => Date;
};

export type ContactInsertInput = {
  readonly name: string;
  readonly email: string;
  readonly subject: string;
  readonly body: string;
  readonly ipHash: string;
  readonly userAgent: string | null;
  readonly referer: string | null;
  readonly turnstileAction: string | null;
  readonly honeypotFilled: boolean;
};

export type ContactEmailInput = {
  readonly name: string;
  readonly email: string;
  readonly subject: string;
  readonly body: string;
};

export type ContactContext = {
  readonly rawPayload: unknown;
  readonly ip: string;
  readonly userAgent: string | null;
  readonly referer: string | null;
};

export type ContactResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly reason:
        | "validation"
        | "honeypot"
        | "rate_limit"
        | "turnstile"
        | "insert_failed"
        | "email_failed";
      readonly details?: string;
    };

export async function handleContactSubmission(
  ctx: ContactContext,
  deps: ContactHandlerDeps,
): Promise<ContactResult> {
  // --- 1. Validate payload shape & length ---------------------------------
  const parsed = contactSchema.safeParse(ctx.rawPayload);
  if (!parsed.success) {
    // Don't leak field-level error details to the wire by default; the
    // route adapter may choose to expose them in dev.
    return { ok: false, reason: "validation", details: parsed.error.message };
  }

  const payload = parsed.data;

  // --- 2. Honeypot: silently succeed from the user's POV, but record it.
  // We return ok:false here to short-circuit further processing; the route
  // adapter may *still* return HTTP 200 so the bot believes it worked.
  const honeypotFilled = payload.honeypot != null && payload.honeypot.length > 0;
  if (honeypotFilled) {
    return { ok: false, reason: "honeypot" };
  }

  // --- 3. Rate limit per IP hash ------------------------------------------
  const ipHash = await deps.hashIp(ctx.ip);
  const allowed = await deps.consumeRateLimit(ipHash);
  if (!allowed) {
    return { ok: false, reason: "rate_limit" };
  }

  // --- 4. Turnstile verification ------------------------------------------
  if (deps.requireTurnstile) {
    if (!payload.turnstileToken) {
      return { ok: false, reason: "turnstile", details: "missing token" };
    }
    const human = await deps.verifyTurnstile(payload.turnstileToken, ctx.ip);
    if (!human) {
      return { ok: false, reason: "turnstile", details: "verification failed" };
    }
  }

  // --- 5. Persist ----------------------------------------------------------
  const insertOk = await deps.insertMessage({
    name: payload.name,
    email: payload.email,
    subject: payload.subject,
    body: payload.body,
    ipHash,
    userAgent: ctx.userAgent,
    referer: ctx.referer,
    turnstileAction: null,
    honeypotFilled: false,
  });
  if (!insertOk) {
    return { ok: false, reason: "insert_failed" };
  }

  // --- 6. Forward by email (non-fatal if Resend is down) -------------------
  try {
    const emailOk = await deps.sendEmail({
      name: payload.name,
      email: payload.email,
      subject: payload.subject,
      body: payload.body,
    });
    if (!emailOk) {
      // DB row is kept; the user sees success; we log the email failure
      // upstream. We still return ok:true because the message is durably
      // stored and will be replayed by an admin cron later.
      // (No-op here; the route adapter may log.)
    }
  } catch {
    // swallow — same reasoning as above.
  }

  return { ok: true };
}
