import Link from "next/link";
import { siteContent } from "@/data/content";

/**
 * Minimal branded 404. Self-contained (no Navbar/Footer) since Navbar is an
 * absolutely-positioned overlay designed to sit on top of Hero's dark photo
 * — there's no such backdrop here, so it would render unreadable
 * warm-white-on-warm-white text.
 */
export default function NotFound() {
  const { name } = siteContent.brand;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-warm-white px-6 py-24 text-center">
      <p className="font-body text-xs font-medium uppercase tracking-[0.2em] text-ocean-navy/50">
        {name}
      </p>
      <p className="mt-8 font-accent text-7xl italic text-terracotta sm:text-8xl">
        404
      </p>
      <h1 className="mt-6 font-heading text-3xl font-semibold text-ocean-navy sm:text-4xl">
        This path wandered off.
      </h1>
      <p className="mt-4 max-w-sm font-body text-base leading-relaxed text-charcoal/70">
        The page you&rsquo;re looking for doesn&rsquo;t exist, or may have moved.
      </p>
      <div className="mt-10 flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-full bg-terracotta px-7 py-3.5 font-body text-sm font-medium tracking-wide text-warm-white transition-colors hover:bg-terracotta/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-navy focus-visible:ring-offset-2 focus-visible:ring-offset-warm-white"
        >
          Back to home
        </Link>
        <Link
          href="/#booking"
          className="font-body text-sm font-medium uppercase tracking-[0.14em] text-ocean-navy/70 underline decoration-ocean-navy/30 underline-offset-4 transition-colors hover:text-terracotta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-navy focus-visible:ring-offset-2 focus-visible:ring-offset-warm-white"
        >
          Book a week
        </Link>
      </div>
    </main>
  );
}
