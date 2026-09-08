import { NextResponse } from "next/server";

export type ApiErrorCode =
  | "INVALID_REQUEST"
  | "WEEK_UNAVAILABLE"
  | "SERVER_ERROR"
  | "RATE_LIMITED"
  | "PAYLOAD_TOO_LARGE";

/**
 * Consistent JSON error shape for every API route in this project:
 * { "error": { "code": "...", "message": "..." } }.
 *
 * `message` must always be safe to show a visitor — never pass through
 * raw Supabase/Postgres error text, stack traces, or anything else that
 * could leak internals. Log the real error server-side separately.
 */
export function apiError(
  status: number,
  code: ApiErrorCode,
  message: string,
  headers?: HeadersInit
) {
  return NextResponse.json({ error: { code, message } }, { status, headers });
}
