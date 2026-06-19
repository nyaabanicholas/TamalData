import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";

// 3 guest orders per IP per 5 minutes
export const orderRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, "5 m"),
      prefix: "tamal:order",
    })
  : null;

// 5 register attempts per IP per hour
export const registerRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 h"),
      prefix: "tamal:register",
    })
  : null;

export function getClientIp(request: Request): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}
