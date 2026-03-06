// Simple in-memory sliding-window rate limiter.
// Resets per serverless cold start — acts as a deterrent, not a hard guarantee.
const seen = new Map<string, { count: number; reset: number }>()

export function checkRateLimit(ip: string, limit = 10, windowMs = 60_000): boolean {
  const now = Date.now()
  const entry = seen.get(ip)
  if (!entry || now > entry.reset) {
    seen.set(ip, { count: 1, reset: now + windowMs })
    return true
  }
  if (entry.count >= limit) return false
  entry.count++
  return true
}
