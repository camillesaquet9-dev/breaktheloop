import "server-only";

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let limiter10perHour: Ratelimit | null = null;
let limiter50perDay: Ratelimit | null = null;

function getRedis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

/** 10 attempts per (challenge, IP) per hour. */
export function getProbeLimiter(): Ratelimit | null {
  if (limiter10perHour) return limiter10perHour;
  const redis = getRedis();
  if (!redis) return null;
  limiter10perHour = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 h"),
    prefix: "btl:probe",
    analytics: false,
  });
  return limiter10perHour;
}

/** 50 attempts per user per day, all challenges combined. */
export function getDailyUserLimiter(): Ratelimit | null {
  if (limiter50perDay) return limiter50perDay;
  const redis = getRedis();
  if (!redis) return null;
  limiter50perDay = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(50, "1 d"),
    prefix: "btl:user-daily",
    analytics: false,
  });
  return limiter50perDay;
}
