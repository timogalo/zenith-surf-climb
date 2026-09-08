import ActionPageShell from "@/components/booking/ActionPageShell";

export const dynamic = "force-dynamic";

const OUTCOMES = {
  confirmed: { title: "Booking confirmed.", body: "The customer has been notified." },
  declined: { title: "Booking declined.", body: "The customer has been notified." },
  "already-processed": {
    title: "Already processed",
    body: "This booking has already been processed.",
  },
  invalid: {
    title: "Invalid link",
    body: "This action link is invalid or has expired.",
  },
} as const;

type OutcomeKey = keyof typeof OUTCOMES;

function isOutcomeKey(value: string | undefined): value is OutcomeKey {
  return typeof value === "string" && value in OUTCOMES;
}

type BookingActionResultPageProps = {
  searchParams: Promise<{ outcome?: string; emailFailed?: string }>;
};

/**
 * Landing page after POST /api/booking-action redirects here. Reads only
 * plain outcome/emailFailed flags from the query string — never booking
 * details, since this page performs no lookup of its own.
 */
export default async function BookingActionResultPage({
  searchParams,
}: BookingActionResultPageProps) {
  const { outcome, emailFailed } = await searchParams;
  const key: OutcomeKey = isOutcomeKey(outcome) ? outcome : "invalid";
  const info = OUTCOMES[key];
  const showEmailNotice = emailFailed === "1" && (key === "confirmed" || key === "declined");

  return (
    <ActionPageShell>
      <h1 className="font-heading text-xl text-ocean-navy">{info.title}</h1>
      <p className="mt-3 font-body text-sm text-ocean-navy/70">{info.body}</p>
      {showEmailNotice && (
        <p className="mt-4 font-body text-sm text-terracotta">
          The status was updated, but the customer email could not be sent. You may want to
          follow up with them directly.
        </p>
      )}
    </ActionPageShell>
  );
}
