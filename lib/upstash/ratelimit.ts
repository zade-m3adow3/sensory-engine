import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter, that allows 20 requests per 1 hour per user ID.
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, "1 h"),
  analytics: true,
  prefix: "@upstash/ratelimit",
});
