import Image from "next/image";
import { siteContent } from "@/data/content";
import Reveal from "@/components/motion/Reveal";
import ImageReveal from "@/components/motion/ImageReveal";
import Parallax from "@/components/motion/Parallax";

export default function Morocco() {
  const { eyebrow, headline, body, themes, image } = siteContent.morocco;

  return (
    <section id="morocco" className="bg-warm-sand">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32 lg:px-12 lg:py-32">
        <div className="lg:flex lg:items-start lg:justify-between lg:gap-20">
          <div className="lg:max-w-xl">
            <Reveal>
              <p className="font-body text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
                {eyebrow}
              </p>
              <h2 className="mt-6 font-heading text-4xl font-semibold leading-[1.1] text-ocean-navy sm:text-5xl lg:text-6xl">
                {headline.lead}{" "}
                <Reveal
                  as="span"
                  delayMs={140}
                  className="font-accent font-normal italic text-terracotta"
                >
                  {headline.accent}
                </Reveal>
              </h2>
            </Reveal>

            <Reveal delayMs={220}>
              <p className="mt-8 max-w-md font-body text-base leading-relaxed text-charcoal/80 sm:text-lg">
                {body}
              </p>

              <ul className="mt-14 max-w-xs space-y-5 border-t border-charcoal/15 pt-8">
                {themes.map((theme, index) => (
                  <li
                    key={theme}
                    className="flex items-baseline gap-4 font-heading text-lg font-medium text-ocean-navy"
                  >
                    <span className="font-accent text-sm italic text-terracotta">
                      0{index + 1}
                    </span>
                    {theme}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>

          <ImageReveal
            className="relative mt-16 aspect-[3/4] w-full overflow-hidden lg:mt-0 lg:w-[32%] lg:self-end"
            delayMs={100}
          >
            <Parallax>
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 32vw, 100vw"
                className="object-cover"
              />
            </Parallax>
          </ImageReveal>
        </div>
      </div>
    </section>
  );
}
