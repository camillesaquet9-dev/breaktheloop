import "server-only";

/**
 * Cloudflare Turnstile server-side verification.
 *
 * Docs: https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
 * Endpoint: https://challenges.cloudflare.com/turnstile/v0/siteverify
 *
 * Errors from Cloudflare are treated as "not human" — we never whitelist
 * on error, to avoid a failure-open bypass.
 */

const ENDPOINT = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstileToken(token: string, ip: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Fail closed in production, fail open in dev (so we can develop without
    // a Turnstile keypair). We detect prod via NODE_ENV.
    return process.env.NODE_ENV !== "production";
  }

  const formData = new URLSearchParams();
  formData.append("secret", secret);
  formData.append("response", token);
  formData.append("remoteip", ip);

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      body: formData,
      headers: { "content-type": "application/x-www-form-urlencoded" },
      // Turnstile should answer fast; bail at 5s so a stalling endpoint
      // doesn't keep the request alive.
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return false;
    const json = (await res.json()) as { success?: boolean };
    return json.success === true;
  } catch {
    return false;
  }
}
