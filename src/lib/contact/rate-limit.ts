import "server-only";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Upstash-backed rate limiter. Sliding window: 3 submissions per hour
 * per IP hash. Enforced BEFORE Turnstile verification so a bot flood
 * doesn't burn our Cloudflare budget.
 *
 * If Upstash env vars are missing (local dev without Redis), we fall back
 * to an in-memory limiter that still enforces the quota per-process. This
 * is NOT safe across multiple workers — prod must have Upstash configured.
 */

const LIMIT = 3;
const WINDOW = "1 h" as const;

let cached: ((key: string) => Promise<{ success: boolean }>) | null = null;

function buildLimiter(): (key: string) => Promise<{ success: boolean }> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    const redis = new Redis({ url, token });
    const limiter = new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(LIMIT, WINDOW),
      prefix: "contact:rl",
      analytics: false,
    });
    return async (key) => {
      const r = await limiter.limit(key);
      return { success: r.success };
    };
  }

  // Fallback: per-process memory limiter for dev.
  const buckets = new Map<string, number[]>();
  return async (key) => {
    const now = Date.now();
    const windowMs = 60 * 60 * 1000;
    const list = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
    if (list.length >= LIMIT) {
      buckets.set(key, list);
      return { success: false };
    }
    list.push(now);
    buckets.set(key, list);
    return { success: true };
  };
}

export async function consumeContactRateLimit(ipHash: string): Promise<boolean> {
  if (!cached) cached = buildLimiter();
  const r = await cached(ipHash);
  return r.success;
}
