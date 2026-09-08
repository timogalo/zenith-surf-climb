import Image from "next/image";
import { siteContent } from "@/data/content";
import Reveal from "@/components/motion/Reveal";
import ImageReveal from "@/components/motion/ImageReveal";
import Parallax from "@/components/motion/Parallax";

// Curated from public/images/paradise-valley/ (20 photos), prioritizing
// nature/destination over the property's pool and terrace shots (which
// make up most of the set and were deliberately excluded — see report).
// Each image keeps its own explicit aspect ratio below; none derive their
// height from an ancestor or from grid stretch.
const dominantImage = {
  src: "/images/paradise-valley/paradise-valley-06.jpg",
  alt: "A turquoise natural pool between red rock canyon walls, with two people swimming and standing on the rocks",
};
const verticalImage = {
  src: "/images/paradise-valley/paradise-valley-11.jpg",
  alt: "A narrow turquoise pool between dark canyon walls with two people swimming",
};
const waterfallImage = {
  src: "/images/paradise-valley/paradise-valley-13.jpg",
  alt: "A small waterfall flowing between large boulders into a calm natural pool",
};
const aerialImage = {
  src: "/images/paradise-valley/paradise-valley-05.jpg",
  alt: "An aerial view of a building surrounded by a dense palm valley and mountains",
};
const palmValleyImage = {
  src: "/images/paradise-valley/paradise-valley-17.jpg",
  alt: "A dense palm valley below a rocky ridge in the Atlas foothills",
};

export default function ParadiseValley() {
  const { eyebrow, heading, body, supportingLine, metadata } =
    siteContent.paradiseValley;
  const [beforeAccent, afterAccent] = heading.split("Endless palms");

  return (
    <section id="paradise-valley" className="bg-warm-white">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32 lg:px-12 lg:py-32">
        <Reveal>
          <p className="font-body text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
            {eyebrow}
          </p>
          <h2 className="mt-6 max-w-3xl font-heading text-4xl font-semibold leading-[1.1] text-ocean-navy sm:text-5xl lg:text-6xl">
            {beforeAccent}
            <span className="font-accent font-normal italic text-terracotta">
              Endless palms
            </span>
            {afterAccent}
          </h2>
          <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-charcoal/70 sm:text-lg">
            {body}
          </p>

          <div className="mt-8 max-w-md">
            <span
              aria-hidden="true"
              className="block h-px w-12 bg-terracotta/50"
            />
            <p className="mt-6 font-body text-sm leading-relaxed text-charcoal/55">
              {supportingLine}
            </p>
          </div>

          <p className="mt-8 font-body text-[11px] font-medium uppercase tracking-[0.16em] text-ocean-navy/60">
            {metadata.map((term, i) => (
              <span
                key={term}
                className={i === 0 ? "text-terracotta/80" : undefined}
              >
                {term}
                {i < metadata.length - 1 && (
                  <span aria-hidden="true" className="mx-3 text-ocean-navy/25">
                    ·
                  </span>
                )}
              </span>
            ))}
          </p>
        </Reveal>

        <div className="mt-14 lg:mt-16">
          {/* Row 1: dominant canyon pool + tall vertical pool, offset lower */}
          <div className="lg:flex lg:items-start lg:gap-8">
            <ImageReveal
              className="relative aspect-[3/2] w-full overflow-hidden lg:w-[62%]"
              direction="up"
            >
              <Parallax>
                <Image
                  src={dominantImage.src}
                  alt={dominantImage.alt}
                  fill
                  sizes="(min-width: 1024px) 62vw, 100vw"
                  className="object-cover"
                />
              </Parallax>
            </ImageReveal>

            <ImageReveal
              className="relative mt-6 aspect-[3/4] w-full overflow-hidden lg:mt-14 lg:w-[35%]"
              direction="left"
              delayMs={80}
              durationMs={680}
            >
              <Image
                src={verticalImage.src}
                alt={verticalImage.alt}
                fill
                sizes="(min-width: 1024px) 33vw, 100vw"
                className="object-cover"
              />
            </ImageReveal>
          </div>

          {/* Row 2: two smaller supporting images, staggered */}
          <div className="mt-6 flex gap-4 lg:mt-10 lg:gap-8">
            <ImageReveal
              className="relative aspect-[4/3] w-1/2 overflow-hidden lg:w-[38%]"
              durationMs={680}
            >
              <Image
                src={waterfallImage.src}
                alt={waterfallImage.alt}
                fill
                sizes="(min-width: 1024px) 24vw, 50vw"
                className="object-cover"
              />
            </ImageReveal>

            <ImageReveal
              className="relative aspect-[4/3] w-1/2 overflow-hidden lg:mt-8 lg:w-[38%]"
              direction="right"
              delayMs={80}
              durationMs={680}
            >
              <Image
                src={aerialImage.src}
                alt={aerialImage.alt}
                fill
                sizes="(min-width: 1024px) 24vw, 50vw"
                className="object-cover"
              />
            </ImageReveal>
          </div>

          {/* Row 3: wide palm valley, breaking the grid, closing the spread */}
          <div className="mt-6 lg:mt-10">
            <ImageReveal
              className="relative aspect-[21/9] w-full overflow-hidden"
              durationMs={680}
            >
              <Image
                src={palmValleyImage.src}
                alt={palmValleyImage.alt}
                fill
                sizes="100vw"
                className="object-cover"
              />
            </ImageReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
