import Image from "next/image";
import { siteContent } from "@/data/content";
import Reveal from "@/components/motion/Reveal";

export default function Hero() {
  const { tagline, supportingLine } = siteContent.brand;
  const { backgroundImage, backgroundAlt, cta, scrollCue } = siteContent.hero;

  const [beforeAccent, accent, afterAccent] = supportingLine.includes("Morocco")
    ? supportingLine.split(/(Morocco)/)
    : [supportingLine, "", ""];

  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden bg-ocean-navy">
      <Image
        src={backgroundImage}
        alt={backgroundAlt}
        fill
        priority
        sizes="100vw"
        className="object-cover animate-hero-image-in"
      />

      {/* Localized scrims for legibility only: top (nav) and bottom (headline block) */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-charcoal/45 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-charcoal/65 via-charcoal/15 to-transparent"
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 pb-20 pt-40 sm:px-8 sm:pb-28 lg:px-12 lg:pb-32">
        <Reveal>
          <h1 className="max-w-4xl font-heading text-5xl font-semibold leading-[1.03] text-warm-white sm:text-6xl lg:text-7xl xl:text-8xl">
            {tagline}
          </h1>
        </Reveal>
        <Reveal delayMs={100}>
          <p className="mt-6 max-w-xl font-body text-lg leading-relaxed text-warm-white/90 sm:text-xl">
            {beforeAccent}
            {accent && (
              <span className="font-accent italic text-warm-sand">
                {accent}
              </span>
            )}
            {afterAccent}
          </p>
        </Reveal>
        <Reveal delayMs={200}>
          <a
            href={cta.href}
            className="group mt-10 inline-flex items-center gap-2 rounded-full bg-terracotta px-7 py-3.5 font-body text-sm font-medium tracking-wide text-warm-white transition-[color,background-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.015] hover:bg-terracotta/90 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-white focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
          >
            {cta.label}
            <svg
              aria-hidden="true"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
            >
              <path d="M3.5 8h9M8.5 4l4 4-4 4" />
            </svg>
          </a>
        </Reveal>
      </div>

      <div className="absolute inset-x-0 bottom-6 hidden justify-center sm:flex">
        <span className="font-body text-xs font-medium uppercase tracking-[0.2em] text-warm-white/60">
          {scrollCue}
        </span>
      </div>

      {/* Single editorial signature detail — a discreet page marker, not a decorative element */}
      <div className="absolute bottom-6 right-6 hidden sm:block sm:right-8 lg:right-12">
        <span className="font-body text-xs font-medium uppercase tracking-[0.2em] text-warm-white/50">
          01 / Zenith
        </span>
      </div>
    </section>
  );
}
