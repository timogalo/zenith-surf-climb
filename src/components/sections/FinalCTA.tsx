import Image from "next/image";
import { siteContent } from "@/data/content";
import Reveal from "@/components/motion/Reveal";
import ImageReveal from "@/components/motion/ImageReveal";
import Parallax from "@/components/motion/Parallax";

// Reuses an existing client photo already featured in About/Experiences/
// Gallery. No new asset. Treated as a decorative closing accent rather
// than new content — alt left empty since this exact photo (and its
// description) is already presented elsewhere on the page.
const closingImage = {
  src: "/images/location/zenith-coast-03.JPG",
  alt: "",
};

export default function FinalCTA() {
  const { tagline } = siteContent.brand;
  const { eyebrow, headline, cta } = siteContent.finalCta;
  const [headlineLead, headlineRest] = headline.split("Zenith");

  return (
    <section id="contact" className="bg-ocean-navy">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32 lg:px-12 lg:pt-32 lg:pb-28">
        <Reveal
          className="hidden lg:flex lg:justify-end"
          distanceClass="translate-y-3"
          durationMs={480}
        >
          <span className="font-body text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
            04 / {eyebrow.toUpperCase()}
          </span>
        </Reveal>

        <div className="lg:mt-8 lg:flex lg:items-start lg:justify-between lg:gap-12">
          <div className="lg:w-[60%]">
            <Reveal
              distanceClass="translate-y-3"
              durationMs={520}
              delayMs={50}
            >
              <p className="font-body text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
                {eyebrow}
              </p>
            </Reveal>

            <h2 className="mt-6 max-w-2xl font-heading text-4xl font-semibold leading-[1.08] text-warm-white sm:text-5xl lg:text-6xl">
              <Reveal
                as="span"
                distanceClass="translate-y-4"
                durationMs={620}
                delayMs={110}
              >
                {headlineLead}
              </Reveal>
              <Reveal
                as="span"
                distanceClass="translate-y-4"
                durationMs={620}
                delayMs={190}
                className="font-accent font-normal italic text-terracotta"
              >
                Zenith{headlineRest}
              </Reveal>
            </h2>

            <Reveal distanceClass="translate-y-4" durationMs={580} delayMs={270}>
              <p className="mt-6 font-body text-lg text-warm-white/80 sm:text-xl">
                {tagline}
              </p>
            </Reveal>

            <Reveal durationMs={580} delayMs={350}>
              <a
                href={cta.href}
                className="group mt-12 inline-flex items-center gap-2 rounded-full bg-terracotta px-7 py-3.5 font-body text-sm font-medium tracking-wide text-warm-white transition-[color,background-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.015] hover:bg-terracotta/90 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-white focus-visible:ring-offset-2 focus-visible:ring-offset-ocean-navy motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
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

          <div className="mt-12 lg:mt-6 lg:w-[29%]">
            <ImageReveal
              className="relative aspect-[3/4] w-full overflow-hidden"
              direction="right"
              durationMs={800}
              scaleFrom="1.02"
            >
              <Parallax>
                <Image
                  src={closingImage.src}
                  alt={closingImage.alt}
                  fill
                  sizes="(min-width: 1024px) 30vw, 100vw"
                  className="object-cover"
                />
              </Parallax>
            </ImageReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
