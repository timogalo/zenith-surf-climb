import type { ReactNode } from "react";

/**
 * Minimal branded shell for the two owner-facing booking-action pages
 * (src/app/booking/action). Deliberately has no navbar/footer — these
 * pages are only ever reached from a signed link in an email, not
 * navigated to as part of the site.
 */
export default function ActionPageShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-warm-white px-6 py-16">
      <div className="w-full max-w-md border border-ocean-navy/10 bg-white px-8 py-10">
        <p className="font-body text-xs uppercase tracking-[0.14em] text-ocean-navy/45">
          Zenith Nomads
        </p>
        <div className="mt-5">{children}</div>
      </div>
    </main>
  );
}
