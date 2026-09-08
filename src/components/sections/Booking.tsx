"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type FormEvent,
} from "react";
import { siteContent } from "@/data/content";
import Reveal from "@/components/motion/Reveal";
import WeekSelector from "@/components/booking/WeekSelector";
import GuestSelector from "@/components/booking/GuestSelector";
import {
  formatDayMonth,
  formatFullDate,
  getWeeksServerSnapshot,
  getWeeksSnapshot,
  parseDateId,
  subscribeToWeeks,
  type AvailableWeekSlot,
} from "@/lib/weeks";

const WEEKS_VISIBLE_INITIALLY = 8;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FormState = {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  message: string;
};

const initialFormState: FormState = {
  fullName: "",
  email: "",
  phone: "",
  country: "",
  message: "",
};

// Honeypot: a field real visitors never see or interact with (offscreen +
// aria-hidden + removed from tab order, so it's a non-issue for
// keyboard/screen-reader users), but a simple bot filling every <input> it
// finds in the DOM will fill it. A non-empty value here fails server-side
// validation (see the honeypot check in src/app/api/bookings/route.ts).
// This is a secondary layer, not the primary defense — rate limiting and
// field validation matter more.
const HONEYPOT_FIELD_NAME = "website";

type AvailabilityState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "loaded"; blockedWeeks: Set<string> };

type BookingApiResult = {
  bookingId: string;
  startDate: string;
  endDate: string;
  guests: number;
  totalPrice: number;
  status: string;
};

type ApiErrorBody = { error?: { code?: string; message?: string } };

function formatDateRange(startId: string, endId: string): string {
  const start = parseDateId(startId);
  const end = parseDateId(endId);
  if (!start || !end) return `${startId} → ${endId}`;
  return `${formatDayMonth(start)} → ${formatFullDate(end)}`;
}

export default function Booking() {
  const {
    eyebrow,
    heading,
    intro,
    confirmationNote,
    pricePerPerson,
    included,
    emptyWeekPrompt,
    form,
    success,
  } = siteContent.booking;
  const [beforeAccent, afterAccent] = heading.split("the rest");

  // Client-only, hydration-safe date generation: see the comment above
  // these functions in src/lib/weeks.ts for why this can't just be a
  // useState/useEffect pair. This only produces the calendar dates —
  // availability (which of these are blocked) is separate, real,
  // asynchronous state fetched from Supabase below.
  const weeks = useSyncExternalStore(
    subscribeToWeeks,
    getWeeksSnapshot,
    getWeeksServerSnapshot
  );

  const [availability, setAvailability] = useState<AvailabilityState>({
    status: "loading",
  });

  // Pure fetch, no setState of its own — kept separate from
  // retryAvailability below so the initial mount effect can call it
  // without a synchronous setState in the effect body (the initial
  // `availability` state is already "loading", so nothing needs to set
  // that again on first mount; setState only happens once the fetch's
  // promise resolves, which is the standard/safe "fetch in an effect"
  // shape rather than a synchronous cascading render).
  const fetchAvailability = useCallback((): Promise<AvailabilityState> => {
    return fetch("/api/availability")
      .then((response) => {
        if (!response.ok) throw new Error("availability request failed");
        return response.json();
      })
      .then((data: { blockedWeeks?: unknown }) => {
        const blocked = Array.isArray(data.blockedWeeks) ? data.blockedWeeks : [];
        return {
          status: "loaded" as const,
          blockedWeeks: new Set(
            blocked.filter((id): id is string => typeof id === "string")
          ),
        };
      })
      .catch(() => ({ status: "error" as const }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchAvailability().then((result) => {
      if (!cancelled) setAvailability(result);
    });
    return () => {
      cancelled = true;
    };
  }, [fetchAvailability]);

  // Used by the Retry button and the 409-conflict handler — both are
  // event-driven (not effect bodies), so resetting to "loading" here
  // synchronously is fine.
  const retryAvailability = useCallback(() => {
    setAvailability({ status: "loading" });
    fetchAvailability().then(setAvailability);
  }, [fetchAvailability]);

  const availableWeeks: AvailableWeekSlot[] = useMemo(() => {
    if (availability.status !== "loaded") return [];
    return weeks.map((week) => ({
      ...week,
      isAvailable: !availability.blockedWeeks.has(week.id),
    }));
  }, [weeks, availability]);

  const [showAllWeeks, setShowAllWeeks] = useState(false);
  const [selectedWeekId, setSelectedWeekId] = useState<string | null>(null);
  const [guests, setGuests] = useState(1);
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [honeypot, setHoneypot] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<BookingApiResult | null>(null);

  const visibleWeeks = showAllWeeks
    ? availableWeeks
    : availableWeeks.slice(0, WEEKS_VISIBLE_INITIALLY);

  const selectedWeek = useMemo(
    () => availableWeeks.find((week) => week.id === selectedWeekId) ?? null,
    [availableWeeks, selectedWeekId]
  );

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-IE", {
        style: "currency",
        currency: "EUR",
        maximumFractionDigits: 0,
      }),
    []
  );
  const priceFormatted = currencyFormatter.format(pricePerPerson);
  const totalFormatted = currencyFormatter.format(guests * pricePerPerson);

  const isEmailValid = EMAIL_PATTERN.test(formState.email.trim());
  const canSubmit =
    availability.status === "loaded" &&
    Boolean(selectedWeek?.isAvailable) &&
    formState.fullName.trim().length > 0 &&
    isEmailValid &&
    formState.phone.trim().length > 0;

  function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
    setFormState((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || isSubmitting || !selectedWeek) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate: selectedWeek.id,
          guests,
          fullName: formState.fullName,
          email: formState.email,
          phone: formState.phone,
          country: formState.country,
          message: formState.message,
          [HONEYPOT_FIELD_NAME]: honeypot,
        }),
      });

      if (response.ok) {
        const data = (await response.json()) as BookingApiResult;
        setBookingResult(data);
        return;
      }

      const errorBody: ApiErrorBody | null = await response.json().catch(() => null);
      const message =
        errorBody?.error?.message ?? "Something went wrong. Please try again.";

      if (response.status === 409) {
        // The week was blocked after the page loaded. Drop the stale
        // selection and refresh availability from the server rather than
        // trusting anything the browser fetched earlier.
        setSelectedWeekId(null);
        retryAvailability();
      }

      setSubmitError(message);
    } catch {
      setSubmitError(
        "We couldn't reach the server. Check your connection and try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleReset() {
    setBookingResult(null);
    setSubmitError(null);
    setSelectedWeekId(null);
    setGuests(1);
    setFormState(initialFormState);
    setHoneypot("");
  }

  const selectedRangeText = selectedWeek
    ? `${formatDayMonth(selectedWeek.start)} → ${formatFullDate(selectedWeek.end)}`
    : "";

  return (
    <section id="booking" className="bg-warm-sand">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32 lg:px-12 lg:py-32">
        <Reveal>
          <p className="font-body text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
            {eyebrow}
          </p>
          <h2 className="mt-6 max-w-2xl font-heading text-4xl font-semibold leading-[1.1] text-ocean-navy sm:text-5xl lg:text-6xl">
            {beforeAccent}
            <span className="font-accent font-normal italic text-terracotta">
              the rest
            </span>
            {afterAccent}
          </h2>
          <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-charcoal/70 sm:text-lg">
            {intro}
          </p>
          <p className="mt-4 max-w-xl font-body text-sm text-charcoal/55">
            {confirmationNote}
          </p>
        </Reveal>

        {bookingResult ? (
          <Reveal className="mt-14 max-w-xl lg:mt-16">
            <span
              aria-hidden="true"
              className="block h-px w-12 bg-terracotta/50"
            />
            <h3 className="mt-6 font-heading text-4xl font-semibold text-ocean-navy sm:text-5xl">
              {success.heading}
            </h3>
            <p className="mt-4 font-heading text-xl font-medium text-terracotta sm:text-2xl">
              {formatDateRange(bookingResult.startDate, bookingResult.endDate)}
            </p>
            <p className="mt-6 font-body text-base leading-relaxed text-charcoal/75 sm:text-lg">
              {success.body.replace(
                "{dates}",
                formatDateRange(bookingResult.startDate, bookingResult.endDate)
              )}
            </p>
            <p className="mt-3 font-body text-sm text-charcoal/55">
              {success.note}
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="mt-8 inline-flex items-center font-body text-sm font-medium uppercase tracking-[0.14em] text-terracotta underline decoration-terracotta/40 underline-offset-4 transition-colors hover:text-ocean-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-navy focus-visible:ring-offset-2 focus-visible:ring-offset-warm-sand"
            >
              {success.resetLabel}
            </button>
          </Reveal>
        ) : (
          <div className="mt-14 lg:mt-16 lg:flex lg:items-start lg:gap-16">
            <Reveal className="lg:w-[54%]">
              <p className="font-body text-xs font-medium uppercase tracking-[0.2em] text-ocean-navy/50">
                Available Weeks
              </p>

              {weeks.length === 0 || availability.status === "loading" ? (
                <p className="mt-6 font-body text-sm text-charcoal/55">
                  Checking availability…
                </p>
              ) : availability.status === "error" ? (
                <div className="mt-6">
                  <p className="font-body text-sm text-charcoal/70">
                    We couldn&rsquo;t load availability right now.
                  </p>
                  <button
                    type="button"
                    onClick={retryAvailability}
                    className="mt-3 font-body text-sm font-medium uppercase tracking-[0.14em] text-terracotta underline decoration-terracotta/40 underline-offset-4 transition-colors hover:text-ocean-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-navy focus-visible:ring-offset-2 focus-visible:ring-offset-warm-sand"
                  >
                    Retry
                  </button>
                </div>
              ) : (
                <>
                  <div className="mt-6">
                    <WeekSelector
                      weeks={visibleWeeks}
                      selectedWeekId={selectedWeekId}
                      onSelect={setSelectedWeekId}
                    />
                  </div>

                  {!showAllWeeks && availableWeeks.length > WEEKS_VISIBLE_INITIALLY && (
                    <button
                      type="button"
                      onClick={() => setShowAllWeeks(true)}
                      className="mt-6 font-body text-sm font-medium uppercase tracking-[0.14em] text-terracotta underline decoration-terracotta/40 underline-offset-4 transition-colors hover:text-ocean-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-navy focus-visible:ring-offset-2 focus-visible:ring-offset-warm-sand"
                    >
                      Show more dates
                    </button>
                  )}
                </>
              )}
            </Reveal>

            <Reveal delayMs={100} className="mt-14 lg:mt-0 lg:w-[40%]">
              <div>
                <p className="font-body text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
                  Your Week
                </p>

                {selectedWeek ? (
                  <>
                    <p className="mt-3 font-heading text-2xl font-semibold text-ocean-navy sm:text-3xl">
                      {selectedRangeText}
                    </p>
                    <p className="mt-1 font-body text-xs uppercase tracking-[0.14em] text-ocean-navy/50">
                      7 nights
                    </p>
                  </>
                ) : (
                  <p className="mt-3 font-body text-base text-charcoal/55">
                    {emptyWeekPrompt}
                  </p>
                )}

                <div
                  className={`transition-opacity ${
                    selectedWeek ? "opacity-100" : "opacity-50"
                  }`}
                >
                  <div className="mt-8 border-t border-ocean-navy/10 pt-6">
                    <p className="font-body text-xs font-medium uppercase tracking-[0.2em] text-ocean-navy/50">
                      Guests
                    </p>
                    <div className="mt-3 flex items-center justify-between gap-4">
                      <GuestSelector guests={guests} onChange={setGuests} />
                      <span className="font-body text-sm text-charcoal/60">
                        {priceFormatted} per person
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-ocean-navy/10 pt-6">
                    <p className="font-body text-xs font-medium uppercase tracking-[0.2em] text-ocean-navy/50">
                      Total
                    </p>
                    <span
                      aria-live="polite"
                      className="mt-2 block font-heading text-4xl font-semibold text-ocean-navy sm:text-5xl"
                    >
                      {totalFormatted}
                    </span>
                  </div>

                  <p className="mt-6 font-body text-xs uppercase tracking-[0.14em] text-ocean-navy/50">
                    {included.join(" · ")}
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="mt-8 border-t border-ocean-navy/10 pt-8"
              >
                {/* Honeypot — invisible and unreachable to real visitors
                    (offscreen, aria-hidden, out of tab order); left empty
                    by everyone except bots that blindly fill every input
                    they find. See the constant above and the server-side
                    check in src/app/api/bookings/route.ts. */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute left-[-9999px] top-0 h-px w-px overflow-hidden"
                >
                  <label htmlFor="booking-website">Website</label>
                  <input
                    id="booking-website"
                    name={HONEYPOT_FIELD_NAME}
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    value={honeypot}
                    onChange={(event) => setHoneypot(event.target.value)}
                  />
                </div>

                <div className="space-y-5">
                  <div>
                    <label
                      htmlFor="booking-name"
                      className="block font-body text-xs font-medium uppercase tracking-[0.14em] text-ocean-navy/60"
                    >
                      {form.fullNameLabel}
                      <span aria-hidden="true" className="text-ocean-navy/40">
                        {" "}
                        *
                      </span>
                    </label>
                    <input
                      id="booking-name"
                      type="text"
                      required
                      autoComplete="name"
                      value={formState.fullName}
                      onChange={(event) =>
                        updateField("fullName", event.target.value)
                      }
                      className="booking-field mt-2 w-full border-b border-ocean-navy/20 bg-transparent py-2 font-body text-base text-ocean-navy focus:border-terracotta focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="booking-email"
                      className="block font-body text-xs font-medium uppercase tracking-[0.14em] text-ocean-navy/60"
                    >
                      {form.emailLabel}
                      <span aria-hidden="true" className="text-ocean-navy/40">
                        {" "}
                        *
                      </span>
                    </label>
                    <input
                      id="booking-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={formState.email}
                      onChange={(event) =>
                        updateField("email", event.target.value)
                      }
                      className="booking-field mt-2 w-full border-b border-ocean-navy/20 bg-transparent py-2 font-body text-base text-ocean-navy focus:border-terracotta focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="booking-phone"
                      className="block font-body text-xs font-medium uppercase tracking-[0.14em] text-ocean-navy/60"
                    >
                      {form.phoneLabel}
                      <span aria-hidden="true" className="text-ocean-navy/40">
                        {" "}
                        *
                      </span>
                    </label>
                    <input
                      id="booking-phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      value={formState.phone}
                      onChange={(event) =>
                        updateField("phone", event.target.value)
                      }
                      className="booking-field mt-2 w-full border-b border-ocean-navy/20 bg-transparent py-2 font-body text-base text-ocean-navy focus:border-terracotta focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="booking-country"
                      className="block font-body text-xs font-medium uppercase tracking-[0.14em] text-ocean-navy/60"
                    >
                      {form.countryLabel}{" "}
                      <span className="normal-case text-ocean-navy/40">
                        (optional)
                      </span>
                    </label>
                    <input
                      id="booking-country"
                      type="text"
                      autoComplete="country-name"
                      value={formState.country}
                      onChange={(event) =>
                        updateField("country", event.target.value)
                      }
                      className="booking-field mt-2 w-full border-b border-ocean-navy/20 bg-transparent py-2 font-body text-base text-ocean-navy focus:border-terracotta focus:outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="booking-message"
                      className="block font-body text-xs font-medium uppercase tracking-[0.14em] text-ocean-navy/60"
                    >
                      {form.messageLabel}{" "}
                      <span className="normal-case text-ocean-navy/40">
                        (optional)
                      </span>
                    </label>
                    <textarea
                      id="booking-message"
                      rows={3}
                      value={formState.message}
                      onChange={(event) =>
                        updateField("message", event.target.value)
                      }
                      className="booking-field mt-2 w-full resize-none border-b border-ocean-navy/20 bg-transparent py-2 font-body text-base text-ocean-navy focus:border-terracotta focus:outline-none"
                    />
                  </div>
                </div>

                {submitError && (
                  <p role="alert" className="mt-4 font-body text-sm text-terracotta">
                    {submitError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  className="group mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-terracotta px-7 py-3.5 font-body text-sm font-medium tracking-wide text-warm-white transition-[color,background-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.015] hover:bg-terracotta/90 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-navy focus-visible:ring-offset-2 focus-visible:ring-offset-warm-sand disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:bg-terracotta motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100 sm:w-auto"
                >
                  {isSubmitting ? (
                    "Sending request…"
                  ) : (
                    <>
                      {form.submitLabel}
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 16 16"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 motion-reduce:transition-none"
                      >
                        <path d="M3.5 8h9M8.5 4l4 4-4 4" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </Reveal>
          </div>
        )}
      </div>
    </section>
  );
}
