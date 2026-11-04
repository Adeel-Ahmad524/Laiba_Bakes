type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/**
 * Lightweight in-process rate limiter for form spam. This is a second layer
 * after validation and the honeypot field; use a durable edge rate limiter for
 * multi-instance deployments with very high traffic.
 */
export function rateLimit(key: string, options?: { limit?: number; windowMs?: number }) {
  const limit = options?.limit ?? 8;
  const windowMs = options?.windowMs ?? 60_000;
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  existing.count += 1;
  if (existing.count > limit) {
    return { allowed: false, remaining: 0 };
  }
  return { allowed: true, remaining: limit - existing.count };
}

export function cleanupRateLimitBuckets() {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}
