import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

// Stateless, signed admin session tokens — same tamper-evident pattern as
// src/lib/booking/action-token.ts (HMAC-SHA256, timingSafeEqual compare,
// no database table needed), but signed with its own ADMIN_SESSION_SECRET
// so rotating one secret never invalidates the other.
//
// Format: `${base64url(JSON payload)}.${base64url(HMAC-SHA256 signature)}`

export type AdminSessionPayload = {
  issuedAt: number;
  /** Epoch milliseconds. */
  expiresAt: number;
  /**
   * Snapshot of admin_credentials.session_version at issue time. Checked
   * against the CURRENT stored version in src/lib/admin/dal.ts (never in
   * src/proxy.ts — that stays a fast, DB-free check) so a password
   * change invalidates every session token issued before it, without a
   * session table.
   */
  sessionVersion: number;
};

export type VerifyAdminSessionResult =
  | { ok: true; payload: AdminSessionPayload }
  | { ok: false; reason: "invalid" | "expired" };

export const ADMIN_SESSION_COOKIE_NAME = "admin_session";

// Every place that sets OR deletes this cookie must use this exact same
// path. Next.js's cookies().delete() only emits a `Path=` attribute in
// the Set-Cookie header if explicitly told to — deleting by name alone
// (no path) produces a DIFFERENT, essentially inert cookie at the
// browser's request-derived default path, leaving the real cookie set
// here untouched. That exact mismatch was the root cause of "logout
// doesn't actually log you out." Import this constant everywhere the
// cookie is written (set or deleted) instead of hardcoding "/admin".
export const ADMIN_SESSION_COOKIE_PATH = "/admin";

/** 7 days — per client decision; see docs/superpowers/specs/2026-09-30-admin-dashboard-design.md. */
export const ADMIN_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// Same minimum as BOOKING_ACTION_SECRET (action-token.ts) — `openssl rand
// -base64 32` produces 44 chars; 32 stays comfortably below that while
// still rejecting trivially weak values.
const MIN_SECRET_LENGTH = 32;

function getSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET is missing. Set it in your environment — see .env.example and " +
        "docs/admin-dashboard.md."
    );
  }
  if (secret.length < MIN_SECRET_LENGTH) {
    throw new Error(
      `ADMIN_SESSION_SECRET is too short (${secret.length} chars; need at least ` +
        `${MIN_SECRET_LENGTH}). Generate a strong value with: openssl rand -base64 32`
    );
  }
  return secret;
}

function sign(payloadB64: string, secret: string): string {
  return createHmac("sha256", secret).update(payloadB64).digest("base64url");
}

export function createAdminSessionToken(sessionVersion: number): string {
  const secret = getSecret();
  const issuedAt = Date.now();
  const payload: AdminSessionPayload = {
    issuedAt,
    expiresAt: issuedAt + ADMIN_SESSION_TTL_MS,
    sessionVersion,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = sign(payloadB64, secret);
  return `${payloadB64}.${signature}`;
}

export function verifyAdminSessionToken(token: string): VerifyAdminSessionResult {
  const secret = getSecret();
  const parts = token.split(".");
  if (parts.length !== 2) {
    return { ok: false, reason: "invalid" };
  }
  const [payloadB64, signature] = parts;

  const expectedSignature = sign(payloadB64, secret);
  const expectedBuffer = Buffer.from(expectedSignature);
  const actualBuffer = Buffer.from(signature);

  // Length check before timingSafeEqual — it throws on mismatched-length
  // buffers, and a length mismatch already means "not equal".
  if (
    expectedBuffer.length !== actualBuffer.length ||
    !timingSafeEqual(expectedBuffer, actualBuffer)
  ) {
    return { ok: false, reason: "invalid" };
  }

  let payload: AdminSessionPayload;
  try {
    const decoded = Buffer.from(payloadB64, "base64url").toString("utf8");
    const parsed: unknown = JSON.parse(decoded);
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      typeof (parsed as Record<string, unknown>).issuedAt !== "number" ||
      typeof (parsed as Record<string, unknown>).expiresAt !== "number" ||
      typeof (parsed as Record<string, unknown>).sessionVersion !== "number"
    ) {
      return { ok: false, reason: "invalid" };
    }
    payload = parsed as AdminSessionPayload;
  } catch {
    return { ok: false, reason: "invalid" };
  }

  if (Date.now() > payload.expiresAt) {
    return { ok: false, reason: "expired" };
  }

  return { ok: true, payload };
}
