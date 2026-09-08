import "server-only";
import { Resend } from "resend";

let cachedClient: Resend | null = null;

function getResendClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      "RESEND_API_KEY is missing. Set it in your environment — see .env.example and " +
        "docs/booking-backend.md."
    );
  }
  if (!cachedClient) {
    cachedClient = new Resend(apiKey);
  }
  return cachedClient;
}

// Resend's shared testing sender. It works without a verified domain, but
// (per Resend's own restriction) only actually delivers to the email
// address the Resend account itself is registered with — fine for local
// development, not for real guests/owner in production. Once a real
// sending domain is verified in Resend, set BOOKING_FROM_EMAIL and this
// fallback is never used. See docs/booking-backend.md.
const DEFAULT_DEV_FROM_EMAIL = "Zenith Surf & Climb <onboarding@resend.dev>";

function getFromEmail(): string {
  return process.env.BOOKING_FROM_EMAIL?.trim() || DEFAULT_DEV_FROM_EMAIL;
}

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export type SendEmailResult = { ok: true } | { ok: false; error: string };

/**
 * Best-effort transactional email send. Never throws — every call site in
 * this project treats email as best-effort AFTER the database write that
 * actually matters (a persisted booking, or a persisted status change), so
 * a Resend/config failure here is logged and swallowed, not propagated.
 */
export async function sendTransactionalEmail(input: SendEmailInput): Promise<SendEmailResult> {
  let client: Resend;
  try {
    client = getResendClient();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Resend client unavailable";
    return { ok: false, error: message };
  }

  try {
    const { error } = await client.emails.send({
      from: getFromEmail(),
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown Resend error";
    return { ok: false, error: message };
  }
}
