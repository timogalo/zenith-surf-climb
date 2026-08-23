import Image from "next/image";
import { siteContent } from "@/data/content";
import Reveal from "@/components/motion/Reveal";
import ImageReveal from "@/components/motion/ImageReveal";
import Parallax from "@/components/motion/Parallax";

const metadataByTitle: Record<string, string[]> = {
  Surf: ["ATLANTIC", "MOVEMENT", "FREEDOM"],
  Climb: ["MOUNTAINS", "MOVEMENT", "CHALLENGE"],
  Create: ["ART", "CREATIVITY", "CULTURE"],
};

// Desktop-only, per-row top/bottom padding. Surf's top (intro → Surf) and
// Create's bottom (Create → Morocco) are section boundaries and stay at
// their original values; only the internal-facing sides (Surf's bottom,
// Climb's top/bottom, Create's top) were tightened.
const rowTopPaddingByIndex = ["lg:pt-20", "lg:pt-16", "lg:pt-16"];
const rowBottomPaddingByIndex = ["lg:pb-12", "lg:pb-12", "lg:pb-16"];

export default function Experiences() {
  const { eyebrow, intro, items } = siteContent.experiences;

  return (
    <section id="experiences" className="bg-warm-white">
      <Reveal className="mx-auto max-w-7xl px-6 pt-16 pb-8 sm:px-8 sm:pt-20 sm:pb-12 lg:px-12 lg:pt-12 lg:pb-2">
        <h2 className="font-body text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
          {eyebrow}
        </h2>
        <p className="mt-6 max-w-2xl font-body text-lg leading-relaxed text-charcoal/80 sm:text-xl">
          {intro}
        </p>
      </Reveal>

      <ol>
        {items.map((item, index) => {
          const isDark = index % 2 === 1;
          const imageOnRight = index % 2 === 0;
          const textLiftClass = isDark ? "" : "lg:-mt-6";

          return (
            <li
              key={item.number}
              className={
                isDark
                  ? "bg-ocean-navy text-warm-white"
                  : "bg-warm-white text-charcoal"
              }
            >
              <div
                className={`mx-auto flex max-w-7xl flex-col gap-10 px-6 py-16 sm:px-8 sm:py-20 lg:items-center lg:gap-12 lg:px-12 ${rowTopPaddingByIndex[index]} ${rowBottomPaddingByIndex[index]} ${
                  imageOnRight ? "lg:flex-row" : "lg:flex-row-reverse"
                }`}
              >
                <ImageReveal className="relative aspect-[4/5] w-full overflow-hidden lg:w-1/2">
                  <Parallax>
                    <Image
                      src={item.image.src}
                      alt={item.image.alt}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover"
                    />
                  </Parallax>
                </ImageReveal>

                <div className={`lg:w-1/2 ${textLiftClass}`}>
                  <Reveal delayMs={80} distanceClass="translate-y-4">
                    <span
                      className={`font-heading text-7xl font-medium sm:text-8xl ${
                        isDark ? "text-terracotta/70" : "text-terracotta/55"
                      }`}
                    >
                      {item.number}
                    </span>
                  </Reveal>

                  <Reveal delayMs={180}>
                    <h3 className="mt-6 font-heading text-4xl font-semibold sm:text-5xl">
                      {item.title}
                    </h3>
                    <p
                      className={`mt-3 font-body text-xs font-medium uppercase tracking-[0.2em] ${
                        isDark ? "text-warm-white/50" : "text-charcoal/50"
                      }`}
                    >
                      {item.number} / {item.label}
                    </p>

                    <p
                      className={`mt-10 max-w-md font-body text-base leading-relaxed sm:text-lg ${
                        isDark ? "text-warm-white/85" : "text-charcoal/80"
                      }`}
                    >
                      {item.copy}
                    </p>

                    <div className="mt-10 lg:mt-12">
                      <span
                        aria-hidden="true"
                        className={`block h-px w-12 ${
                          isDark ? "bg-terracotta/40" : "bg-terracotta/50"
                        }`}
                      />
                      <p
                        className={`mt-3 font-body text-[11px] font-medium uppercase tracking-[0.16em] ${
                          isDark ? "text-warm-white/45" : "text-ocean-navy/60"
                        }`}
                      >
                        {metadataByTitle[item.title].map((term, i) => (
                          <span
                            key={term}
                            className={
                              i === 0
                                ? isDark
                                  ? "text-warm-sand/80"
                                  : "text-terracotta/80"
                                : undefined
                            }
                          >
                            {term}
                            {i < metadataByTitle[item.title].length - 1 && (
                              <span
                                aria-hidden="true"
                                className={`mx-3 ${
                                  isDark
                                    ? "text-warm-white/25"
                                    : "text-ocean-navy/25"
                                }`}
                              >
                                ·
                              </span>
                            )}
                          </span>
                        ))}
                      </p>
                    </div>
                  </Reveal>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
