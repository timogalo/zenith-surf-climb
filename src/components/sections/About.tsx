import Image from "next/image";
import { siteContent } from "@/data/content";
import Reveal from "@/components/motion/Reveal";
import ImageReveal from "@/components/motion/ImageReveal";
import Parallax from "@/components/motion/Parallax";

const themeGapClasses = ["mr-8", "mr-14", "mr-10"];
const themeOffsetClasses = ["", "translate-y-1", "-translate-y-1", "translate-y-0.5"];

export default function About() {
  const { eyebrow, heading, paragraphs, themes, image } = siteContent.about;
  const [beforeMountains, afterMountains] = heading.split("mountains");

  return (
    <section
      id="about"
      className="bg-warm-white pt-24 pb-24 sm:pt-32 sm:pb-32 lg:pt-40 lg:pb-12"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="lg:flex lg:items-start lg:gap-16">
          <Reveal className="lg:w-[42%] lg:shrink-0">
            <p className="font-body text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
              {eyebrow}
            </p>
            <h2 className="mt-4 max-w-md font-heading text-4xl font-semibold leading-[1.08] text-ocean-navy sm:text-5xl lg:text-6xl">
              {beforeMountains}
              <span className="inline-block -ml-1 translate-y-[2px] text-[1.08em] font-accent font-normal italic text-terracotta sm:-ml-2">
                mountains
              </span>
              {afterMountains}
            </h2>

            <div className="mt-8 space-y-5">
              {paragraphs.map((paragraph, index) => (
                <p
                  key={paragraph}
                  className={
                    index === 0
                      ? "max-w-sm font-body text-xl font-medium leading-snug text-charcoal sm:text-2xl"
                      : "max-w-md font-body text-sm leading-relaxed text-charcoal/55 sm:text-base"
                  }
                >
                  {paragraph}
                </p>
              ))}
            </div>

            <div className="mt-14">
              <span
                aria-hidden="true"
                className="block h-px w-12 bg-terracotta/50"
              />
              <ul className="mt-6 flex flex-wrap items-baseline gap-y-4">
                {themes.map((theme, index) => (
                  <li
                    key={theme}
                    className={`font-heading text-sm font-normal uppercase tracking-[0.06em] text-ocean-navy/90 ${
                      index < themes.length - 1 ? themeGapClasses[index] : ""
                    } ${themeOffsetClasses[index] ?? ""}`}
                  >
                    {theme}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <div className="relative mt-14 lg:-mt-20 lg:w-[58%]">
            <ImageReveal className="relative aspect-[4/5] w-full overflow-hidden">
              <Parallax>
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(min-width: 1024px) 56vw, 100vw"
                  className="object-cover object-[center_78%]"
                />
              </Parallax>
            </ImageReveal>

            {/* Secondary detail crop from the same photograph — an art-directed
                inset, not a second image. Left static, no motion of its own. */}
            <div
              aria-hidden="true"
              className="absolute -bottom-3 -right-3 aspect-square w-24 bg-warm-white p-1.5 sm:-bottom-4 sm:-right-4 sm:w-28 lg:-bottom-8 lg:-right-8 lg:w-36"
            >
              <div className="relative h-full w-full overflow-hidden">
                <Image
                  src={image.src}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 144px, (min-width: 640px) 112px, 96px"
                  className="object-cover object-[58%_52%]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
