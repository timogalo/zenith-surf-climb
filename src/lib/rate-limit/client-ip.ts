import "server-only";

/**
 * Best-effort client IP for rate-limiting keys. Deliberately trusts
 * `x-real-ip` / `x-forwarded-for` because this app is deployed on Vercel,
 * whose edge network sets these headers on the request before it reaches
 * the function — a client cannot simply invent an arbitrary value for them
 * the way it could with, say, a custom `x-client-ip` header. This
 * assumption does NOT hold for a bare Node server sitting directly on the
 * public internet with no trusted proxy in front of it; re-verify before
 * deploying anywhere other than Vercel (or another platform that makes the
 * same guarantee about these specific headers).
 *
 * Falls back to a single shared "unknown" bucket if neither header is
 * present (e.g. local dev without a proxy) rather than skipping rate
 * limiting outright.
 */
/**
 * Same extraction, factored out so callers that only have a Headers
 * object — e.g. an admin Server Action reading `await headers()` from
 * `next/headers`, which has no Request to hand getClientIp() below —
 * can rate-limit by the same trusted headers without duplicating this
 * logic. Behavior-identical extraction, not a new trust decision.
 */
export function getClientIpFromHeaders(headers: Pick<Headers, "get">): string {
  const realIp = headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    const first = forwardedFor.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  return "unknown";
}

export function getClientIp(request: Request): string {
  return getClientIpFromHeaders(request.headers);
}
