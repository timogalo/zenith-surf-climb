import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Stateless, signed Approve/Reject link tokens. No database table is
// needed to track these — the token itself carries everything required
// (which booking, which action, when it expires) and is tamper-evident via
// HMAC-SHA256, so a forged or edited token simply fails verification.
//
// Format: `${base64url(JSON payload)}.${base64url(HMAC-SHA256 signature)}`

export type BookingAction = "confirm" | "decline";

export type BookingActionTokenPayload = {
  bookingId: string;
  action: BookingAction;
  /** Epoch milliseconds. */
  expiresAt: number;
};

export type CreateBookingActionTokenInput = BookingActionTokenPayload;

export type VerifyBookingActionTokenResult =
  | { ok: true; payload: BookingActionTokenPayload }
  | { ok: false; reason: "invalid" | "expired" };

/** 7 days, per the task's suggested expiry — not a permanent token system. */
export const BOOKING_ACTION_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// `openssl rand -base64 32` (the recommended generation command — see
// .env.example and docs/booking-backend.md) produces a 44-character
// string. 32 is comfortably below that while still rejecting trivially
// weak values like "test" or "password123".
const MIN_SECRET_LENGTH = 32;

function getSecret(): string {
  const secret = process.env.BOOKING_ACTION_SECRET;
  if (!secret) {
    throw new Error(
      "BOOKING_ACTION_SECRET is missing. Set it in your environment — see .env.example and " +
        "docs/booking-backend.md."
    );
  }
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `BOOKING_ACTION_SECRET is too short (${secret.length} chars; need at least ` +
        `${MIN_SECRET_LENGTH}). Generate a strong value with: openssl rand -base64 32`
    );
  }
  return secret;
}

function sign(payloadB64: string, secret: string): string {
  return createHmac("sha256", secret).update(payloadB64).digest("base64url");
}

function isBookingAction(value: unknown): value is BookingAction {
  return value === "confirm" || value === "decline";
}

export function createBookingActionToken(
  input: CreateBookingActionTokenInput
): string {
  const secret = getSecret();
  const payload: BookingActionTokenPayload = {
    bookingId: input.bookingId,
    action: input.action,
    expiresAt: input.expiresAt,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(payloadB64, secret);
  return `${payloadB64}.${signature}`;
}

export function verifyBookingActionToken(token: string): VerifyBookingActionTokenResult {
  const secret = getSecret();
  const parts = token.split(".");
  if (parts.length !== 2) {
    return { ok: false, reason: "invalid" };
  }
  const [payloadB64, signature] = parts;

  const expectedSignature = sign(payloadB64, secret);
  const expectedBuffer = Buffer.from(expectedSignature);
  const actualBuffer = Buffer.from(signature);

  // Buffers must be equal length before timingSafeEqual — it throws
  // otherwise. A length mismatch already means "not equal", so short-circuit
  // to invalid rather than letting that throw escape.
  if (
    expectedBuffer.length !== actualBuffer.length ||
    !timingSafeEqual(expectedBuffer, actualBuffer)
  ) {
    return { ok: false, reason: "invalid" };
  }

  let payload: BookingActionTokenPayload;
  try {
    const decoded = Buffer.from(payloadB64, "base64url").toString("utf8");
    const parsed: unknown = JSON.parse(decoded);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as Record<string, unknown>).bookingId !== "string" ||
      !isBookingAction((parsed as Record<string, unknown>).action) ||
      typeof (parsed as Record<string, unknown>).expiresAt !== "number"
    ) {
      return { ok: false, reason: "invalid" };
    }
    payload = parsed as BookingActionTokenPayload;
  } catch {
    return { ok: false, reason: "invalid" };
  }

  if (Date.now() > payload.expiresAt) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true, payload };
}
