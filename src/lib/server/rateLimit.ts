import { redis } from "./redis";

export interface CheckRateLimitInput {
  /**
   * Fully-qualified Redis key.
   *
   * Examples:
   *  guest:123:create-comment
   *  user:abc:create-comment
   *  moderator:xyz:create-comment
   */
  key: string;

  /**
   * Maximum requests allowed during the window.
   */
  limit: number;

  /**
   * Window duration in seconds.
   */
  windowSeconds: number;
}

export interface CheckRateLimitResult {
  success: boolean;

  limit: number;

  remaining: number;

  resetAt: Date;
}

export async function checkRateLimit({
  key,
  limit,
  windowSeconds,
}: CheckRateLimitInput): Promise<CheckRateLimitResult> {
  // Increment request count atomically.
  const count = await redis.incr(key);

  // First request creates the TTL window.
  if (count === 1) {
    await redis.expire(key, windowSeconds);
  }

  // Remaining TTL.
  const ttl = await redis.ttl(key);

  const remaining = Math.max(0, limit - count);

  return {
    success: count <= limit,

    limit,

    remaining,

    resetAt: new Date(Date.now() + Math.max(0, ttl) * 1000),
  };
}