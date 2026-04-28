import "server-only";

import { createHash } from "node:crypto";

/**
 * Deterministic, salted SHA-256 of the visitor IP.  Stored alongside attempts
 * so we can correlate abuse without keeping plaintext addresses.
 */
export function hashIp(ip: string): string {
  const salt = process.env.SECRET_IP_SALT;
  if (!salt || salt.length < 32) {
    throw new Error("SECRET_IP_SALT must be set and >= 32 chars (run `openssl rand -hex 32`).");
  }
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

export function hashPayload(payload: string): string {
  return createHash("sha256").update(payload).digest("hex");
}

/** Best-effort client IP from common request headers; falls back to "0.0.0.0". */
export function readClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return (
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    headers.get("fly-client-ip") ??
    "0.0.0.0"
  );
}
