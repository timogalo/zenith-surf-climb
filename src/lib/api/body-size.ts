import "server-only";
import { apiError } from "./errors";

/**
 * Rejects an obviously oversized request before the body is parsed, using
 * the Content-Length header when present. This is a cheap defensive guard,
 * not a full streaming size limiter — a request sent without Content-Length
 * (e.g. chunked transfer-encoding) skips this check entirely and falls
 * through to normal parsing, where the existing per-field length
 * validation (src/lib/booking/validation.ts) still protects downstream
 * logic regardless of body size.
 */
export function rejectIfBodyTooLarge(request: Request, maxBytes: number) {
  const contentLength = request.headers.get("content-length");
  if (!contentLength) {
    return null;
  }

  const size = Number(contentLength);
  if (Number.isFinite(size) && size > maxBytes) {
    return apiError(413, "PAYLOAD_TOO_LARGE", "Request is too large.");
  }

  return null;
}
