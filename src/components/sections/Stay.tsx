import Image from "next/image";
import { siteContent } from "@/data/content";
import Reveal from "@/components/motion/Reveal";
import ImageReveal from "@/components/motion/ImageReveal";
import Parallax from "@/components/motion/Parallax";

// Curated from public/images/stay/ (13 photos), re-reviewed for warmth and
// natural light rather than documentary room coverage. All three share a
// warm, golden-light quality so they read as one atmosphere rather than
// three separate listing thumbnails: sunlit curtain glow, a warm pendant
// glow, and golden-hour balcony light. Bathroom/product close-ups and
// near-duplicate bedroom angles were left out. No aerial/drone shot exists
// in the current set, so none is used. No room type, amenity or facility
// is claimed — these are presented purely as atmosphere.
const dominantImage = {
  src: "/images/stay/stay-01.jpg",
  alt: "A sunlit bedroom with warm wood furniture and framed photographs of Moroccan kasbahs",
};
const secondaryImage = {
  src: "/images/stay/stay-08.jpg",
  alt: "A styled bedroom with a carved wooden bed and a woven pendant light",
};
const detailImage = {
  src: "/images/stay/stay-13.jpg",
  alt: "A woven chair and small ceramic pot on a balcony in warm evening light",
};

export default function Stay() {
  const { eyebrow, heading, body, supportingLine } = siteContent.stay;
  const [beforeAccent, afterAccent] = heading.split("adventures");

  return (
    <section id="stay" className="bg-warm-white">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32 lg:px-12 lg:py-32">
        <div className="lg:flex lg:items-start lg:gap-16">
          <Reveal className="lg:w-[42%] lg:shrink-0">
            <p className="font-body text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
              {eyebrow}
            </p>
            <h2 className="mt-4 max-w-md font-heading text-4xl font-semibold leading-[1.08] text-ocean-navy sm:text-5xl lg:text-6xl">
              {beforeAccent}
              <span className="font-accent font-normal italic text-terracotta">
                adventures
              </span>
              {afterAccent}
            </h2>

            <p className="mt-8 max-w-sm font-body text-base leading-relaxed text-charcoal/70 sm:text-lg">
              {body}
            </p>

            <div className="mt-10">
              <span
                aria-hidden="true"
                className="block h-px w-12 bg-terracotta/50"
              />
              <p className="mt-6 max-w-xs font-body text-sm leading-relaxed text-charcoal/55">
                {supportingLine}
              </p>
            </div>
          </Reveal>

          <div className="relative mt-14 lg:mt-0 lg:w-[58%]">
            <ImageReveal className="relative aspect-[4/5] w-full overflow-hidden">
              <Parallax>
                <Image
                  src={dominantImage.src}
                  alt={dominantImage.alt}
                  fill
                  sizes="(min-width: 1024px) 56vw, 100vw"
                  className="object-cover"
                />
              </Parallax>
            </ImageReveal>

            <div className="mt-6 flex gap-4 lg:-mt-16 lg:ml-auto lg:w-[68%] lg:gap-6">
              <ImageReveal className="relative aspect-[4/5] w-[58%] overflow-hidden lg:w-[60%]">
                <Image
                  src={secondaryImage.src}
                  alt={secondaryImage.alt}
                  fill
                  sizes="(min-width: 1024px) 22vw, 55vw"
                  className="object-cover"
                />
              </ImageReveal>

              <ImageReveal className="relative aspect-square w-[42%] self-end overflow-hidden lg:w-[40%]">
                <Image
                  src={detailImage.src}
                  alt={detailImage.alt}
                  fill
                  sizes="(min-width: 1024px) 15vw, 35vw"
                  className="object-cover"
                />
              </ImageReveal>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
