import Image from "next/image";
import { siteContent } from "@/data/content";
import Reveal from "@/components/motion/Reveal";
import ImageReveal from "@/components/motion/ImageReveal";
import Parallax from "@/components/motion/Parallax";

const sizeSizesAttr = {
  large: "(min-width: 1024px) 56vw, 100vw",
  medium: "(min-width: 1024px) 44vw, 100vw",
  wide: "100vw",
};

const hoverImageClass =
  "object-cover lg:transition-transform lg:duration-[600ms] lg:ease-out lg:hover:scale-[1.012] motion-reduce:transition-none motion-reduce:hover:scale-100";

export default function Gallery() {
  const { eyebrow, heading, images } = siteContent.gallery;
  const [headingLead, headingRest] = heading.split("Zenith");
  const [dominant, upperRight, lowerRight, wide] = images;

  return (
    <section id="gallery" className="bg-warm-white">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32 lg:px-12 lg:py-32">
        <div>
          <Reveal distanceClass="translate-y-3" durationMs={520}>
            <p className="font-body text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
              {eyebrow}
            </p>
          </Reveal>
          <h2 className="mt-6 font-heading text-4xl font-semibold text-ocean-navy sm:text-5xl">
            <Reveal
              as="span"
              distanceClass="translate-y-4"
              durationMs={600}
              delayMs={70}
            >
              {headingLead}
            </Reveal>
            <Reveal
              as="span"
              distanceClass="translate-y-4"
              durationMs={600}
              delayMs={150}
              className="ml-1 font-accent font-normal italic text-terracotta"
            >
              Zenith
            </Reveal>
            {headingRest}
          </h2>
        </div>

        <div className="mt-16 sm:mt-20 lg:mt-24">
          {/*
            Desktop bento: dominant image (left, ~55%) beside an explicit
            right-hand column (~45%) holding the two supporting images.
            lg:aspect-[16/11] on the wrapper gives the whole row a single,
            width-derived height — the same height a lone aspect-[4/5]
            dominant image would have produced at 55% width — and both
            columns stretch (grid's default align-items) to fill exactly
            that height, so they always end on the same baseline instead of
            each column's own aspect-ratio math deciding the row height.
          */}
          <div className="flex flex-col gap-6 sm:gap-8 lg:grid lg:aspect-[16/11] lg:grid-cols-20 lg:items-stretch lg:gap-10">
            {/*
              No ImageReveal here, deliberately. This box combines
              Parallax + the stretched desktop bento geometry (height
              derived from an ancestor's aspect-ratio via CSS Grid stretch,
              not its own aspect-ratio) — the one combination confirmed by
              browser-zoom testing to leave ImageReveal's reveal lifecycle
              permanently stuck at 100% zoom. Reliability here matters more
              than one entrance animation; Parallax and the hover scale are
              unaffected.
            */}
            <div className="relative aspect-[4/5] w-full overflow-hidden lg:aspect-auto lg:col-span-11 lg:h-full">
              <Parallax>
                <Image
                  src={dominant.src}
                  alt={dominant.alt}
                  fill
                  sizes={sizeSizesAttr.large}
                  className={hoverImageClass}
                />
              </Parallax>
            </div>

            {/* On mobile/tablet this wrapper is `contents` — it renders no
                box of its own, so upper/lower images flow as plain stacked
                items in the single column above, unchanged from before. */}
            <div className="contents lg:col-span-9 lg:flex lg:h-full lg:flex-col lg:gap-8">
              <ImageReveal
                className="relative aspect-[4/3] w-full overflow-hidden lg:aspect-auto lg:min-h-0 lg:flex-1"
                direction="left"
                durationMs={680}
                delayMs={85}
              >
                <Image
                  src={upperRight.src}
                  alt={upperRight.alt}
                  fill
                  sizes={sizeSizesAttr.medium}
                  className={hoverImageClass}
                />
              </ImageReveal>

              <ImageReveal
                className="relative aspect-[4/3] w-full overflow-hidden lg:aspect-auto lg:ml-4 lg:min-h-0 lg:flex-1"
                direction="right"
                durationMs={680}
                delayMs={150}
              >
                <Image
                  src={lowerRight.src}
                  alt={lowerRight.alt}
                  fill
                  sizes={sizeSizesAttr.medium}
                  className={hoverImageClass}
                />
              </ImageReveal>
            </div>
          </div>

          {/* Wide closing image — separate from the bento group, with the
              same generous separation as before. */}
          <div className="mt-6 sm:mt-8 lg:mt-16">
            <ImageReveal
              className="relative aspect-[21/9] w-full overflow-hidden"
              direction="up"
              durationMs={800}
              delayMs={100}
              scaleFrom="1.02"
            >
              <Image
                src={wide.src}
                alt={wide.alt}
                fill
                sizes={sizeSizesAttr.wide}
                className={hoverImageClass}
              />
            </ImageReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
