/**
 * Best-effort in-memory rate limiter for Astro API routes.
 *
 * NOTE: on serverless (Vercel) each function instance keeps its own counter,
 * so this is a per-instance guard — not a global one. It still stops casual
 * spam/brute-force from a single client against a warm instance. For a hard
 * global limit, put the route behind Supabase Auth rate limits, Vercel WAF,
 * or an external store (Upstash Redis) later.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Prevent unbounded memory growth: prune rarely.
let lastPrune = Date.now();

function prune(now: number): void {
  if (now - lastPrune < 60_000) return;
  lastPrune = now;
  for (const [key, b] of buckets) {
    if (b.resetAt <= now) buckets.delete(key);
  }
  // Hard cap — drop oldest entries if something pathological happens.
  if (buckets.size > 5_000) {
    const excess = buckets.size - 5_000;
    const keys = buckets.keys();
    for (let i = 0; i < excess; i++) {
      const k = keys.next();
      if (k.done) break;
      buckets.delete(k.value);
    }
  }
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  prune(now);
  const entry = buckets.get(key);
  if (!entry || entry.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSec: 0 };
  }
  if (entry.count < limit) {
    entry.count += 1;
    return { allowed: true, retryAfterSec: 0 };
  }
  return {
    allowed: false,
    retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
  };
}
