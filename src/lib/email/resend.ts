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

// zenithnomads.com is now verified in Resend, so this is the real default
// sender for every transactional booking email (owner notification,
// customer confirmation, customer decline — all of them go through
// sendTransactionalEmail below, so changing this one constant updates all
// of them consistently). BOOKING_FROM_EMAIL remains available as an
// override (e.g. pointing at a different verified address later) — see
// docs/booking-backend.md.
const DEFAULT_FROM_EMAIL = "Zenith Nomads <bookings@zenithnomads.com>";

function getFromEmail(): string {
  return process.env.BOOKING_FROM_EMAIL?.trim() || DEFAULT_FROM_EMAIL;
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
