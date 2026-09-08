// Server-side validation for POST /api/bookings. Pure and framework-free
// so it can be reasoned about (and unit tested later) in isolation from
// Next.js/Supabase.
//
// This is the ONLY place that decides whether submitted booking data is
// acceptable. The browser-supplied payload is never trusted for
// authoritative values (status/endDate/price/total) — those are always
// computed here, never read from the input.

import { addDays, isMonday, isPastDate, parseDateId, toDateId } from "@/lib/weeks";

export const PRICE_PER_PERSON = 900;

// Technical safety ceiling only — NOT Zenith's capacity limit. Real
// per-week capacity is intentionally undefined (see docs/booking-backend.md
// and the Phase 3 audit); this exists purely so an absurd guest count can't
// overflow the `bookings.guests` / `bookings.total_price` Postgres
// `integer` columns (max ~2.147 billion) or produce a nonsensical
// total_price. Chosen to be far above any realistic group size while
// staying comfortably below the overflow point (500 * 900 = 450,000, a
// tiny fraction of int4's range). Never surface this number to the
// customer as "our maximum capacity" — it isn't one.
const MAX_GUESTS_TECHNICAL_LIMIT = 500;

const MAX_NAME_LENGTH = 120;
const MAX_EMAIL_LENGTH = 200;
const MAX_PHONE_LENGTH = 40;
const MAX_COUNTRY_LENGTH = 100;
const MAX_MESSAGE_LENGTH = 1000;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type BookingInput = {
  startDate: unknown;
  guests: unknown;
  fullName: unknown;
  email: unknown;
  phone: unknown;
  country?: unknown;
  message?: unknown;
};

export type ValidatedBooking = {
  startDateId: string;
  endDateId: string;
  guests: number;
  fullName: string;
  email: string;
  phone: string;
  country: string | null;
  message: string | null;
};

export type ValidationResult =
  | { ok: true; data: ValidatedBooking }
  | { ok: false; message: string };

export function validateBookingInput(
  input: BookingInput,
  referenceDate: Date = new Date()
): ValidationResult {
  // --- startDate: must be a real date, a Monday, and not in the past ---
  if (typeof input.startDate !== "string") {
    return { ok: false, message: "Choose a week to continue." };
  }

  const start = parseDateId(input.startDate);
  if (!start) {
    return { ok: false, message: "Choose a valid week." };
  }
  if (!isMonday(start)) {
    return { ok: false, message: "Stays must start on a Monday." };
  }
  if (isPastDate(start, referenceDate)) {
    return { ok: false, message: "Choose an upcoming week." };
  }

  const startDateId = toDateId(start);
  const endDateId = toDateId(addDays(start, 7));

  // --- guests: integer, minimum 1, no configured business-capacity maximum ---
  if (
    typeof input.guests !== "number" ||
    !Number.isInteger(input.guests) ||
    input.guests < 1
  ) {
    return { ok: false, message: "Guests must be at least 1." };
  }
  // Technical safety ceiling, not a capacity rule — see the comment on
  // MAX_GUESTS_TECHNICAL_LIMIT above.
  if (input.guests > MAX_GUESTS_TECHNICAL_LIMIT) {
    return {
      ok: false,
      message: "Please enter a realistic number of guests, or contact us directly for larger groups.",
    };
  }
  const guests = input.guests;

  // --- fullName ---
  if (typeof input.fullName !== "string" || input.fullName.trim().length === 0) {
    return { ok: false, message: "Enter your full name." };
  }
  const fullName = input.fullName.trim();
  if (fullName.length > MAX_NAME_LENGTH) {
    return { ok: false, message: "Full name is too long." };
  }

  // --- email ---
  if (typeof input.email !== "string" || input.email.trim().length === 0) {
    return { ok: false, message: "Enter your email." };
  }
  const trimmedEmail = input.email.trim();
  if (trimmedEmail.length > MAX_EMAIL_LENGTH) {
    return { ok: false, message: "Email is too long." };
  }
  if (!EMAIL_PATTERN.test(trimmedEmail)) {
    return { ok: false, message: "Enter a valid email address." };
  }
  const email = trimmedEmail.toLowerCase();

  // --- phone: presence only, no international format enforcement ---
  if (typeof input.phone !== "string" || input.phone.trim().length === 0) {
    return { ok: false, message: "Enter your phone or WhatsApp number." };
  }
  const phone = input.phone.trim();
  if (phone.length > MAX_PHONE_LENGTH) {
    return { ok: false, message: "Phone number is too long." };
  }

  // --- country: optional ---
  let country: string | null = null;
  if (typeof input.country === "string" && input.country.trim().length > 0) {
    const trimmedCountry = input.country.trim();
    if (trimmedCountry.length > MAX_COUNTRY_LENGTH) {
      return { ok: false, message: "Country is too long." };
    }
    country = trimmedCountry;
  }

  // --- message: optional ---
  let message: string | null = null;
  if (typeof input.message === "string" && input.message.trim().length > 0) {
    const trimmedMessage = input.message.trim();
    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      return { ok: false, message: "Message is too long." };
    }
    message = trimmedMessage;
  }

  return {
    ok: true,
    data: { startDateId, endDateId, guests, fullName, email, phone, country, message },
  };
}
