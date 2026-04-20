import "server-only";

/**
 * Deterministic IP hashing. SHA-256(ip || SECRET_IP_SALT).
 *
 * We NEVER persist raw IPs — only the hash — which is what the
 * contact_messages.ip_hash column expects (CHECK length = 64).
 *
 * The salt MUST be 32+ bytes of entropy and MUST NOT change once messages
 * exist, otherwise rate-limit lookups on (ip_hash, created_at) desync.
 */
export async function hashIpWithSalt(ip: string): Promise<string> {
  const salt = process.env.SECRET_IP_SALT;
  if (!salt || salt.length < 32) {
    throw new Error(
      "[contact] SECRET_IP_SALT must be set to a value of 32+ characters. " +
        "Generate one with: openssl rand -hex 32",
    );
  }
  const encoder = new TextEncoder();
  const data = encoder.encode(`${ip}|${salt}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return bytesToHex(new Uint8Array(digest));
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Extract the "best" client IP from standard proxy headers.
 * Order of trust: CF-Connecting-IP (when behind Cloudflare) →
 * x-forwarded-for leftmost → x-real-ip → fallback string.
 */
export function extractClientIp(headers: Headers): string {
  const cf = headers.get("cf-connecting-ip");
  if (cf) return cf.trim();

  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }

  const real = headers.get("x-real-ip");
  if (real) return real.trim();

  return "0.0.0.0";
}
