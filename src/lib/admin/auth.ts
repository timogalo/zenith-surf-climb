import "server-only";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// Pure scrypt hashing/verification primitives — no knowledge of WHERE a
// hash is stored. src/lib/admin/credentials.ts owns that (the Supabase
// admin_credentials table); this file is only the crypto, reused by both
// the one-off bootstrap value (ADMIN_PASSWORD_HASH, see
// docs/admin-dashboard.md) and every subsequent password change.

const SCRYPT_KEY_LENGTH = 64;

/** Enforced on new passwords in the Settings "change password" form. */
export const MIN_PASSWORD_LENGTH = 10;

/**
 * Generates a new `${saltHex}:${hashHex}` value. Used both by the
 * one-off setup command documented in docs/admin-dashboard.md (so a real
 * password never needs to pass through any file committed to this repo)
 * and by src/lib/admin/credentials.ts when the admin changes her
 * password from /admin/settings.
 */
export function hashAdminPassword(password: string): string {
  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, SCRYPT_KEY_LENGTH);
  return `${salt.toString("hex")}:${derived.toString("hex")}`;
}

/**
 * Constant-time password check against an already-fetched `salt:hash`
 * value. Fails closed (returns false) on a malformed hash rather than
 * throwing — a corrupted stored value must never crash the login/change-
 * password flow, just reject the attempt.
 */
export function verifyPasswordAgainstHash(password: string, storedHash: string): boolean {
  const separatorIndex = storedHash.indexOf(":");
  if (separatorIndex === -1) {
    console.error("[admin/auth] stored password hash is malformed — expected 'salt:hash'.");
    return false;
  }

  const salt = Buffer.from(storedHash.slice(0, separatorIndex), "hex");
  const expected = Buffer.from(storedHash.slice(separatorIndex + 1), "hex");
  if (salt.length === 0 || expected.length === 0) {
    console.error("[admin/auth] stored password hash is malformed — expected 'salt:hash'.");
    return false;
  }

  const derived = scryptSync(password, salt, expected.length);
  return timingSafeEqual(derived, expected);
}
