import Image from "next/image";
import { siteContent } from "@/data/content";
import Reveal from "@/components/motion/Reveal";
import ImageReveal from "@/components/motion/ImageReveal";
import Parallax from "@/components/motion/Parallax";

// Reuses an existing client photo (already used in About/Experiences/
// Gallery/FinalCTA) — the only one of the four location photos with a
// human figure in it, giving it the movement/lifestyle quality this
// section calls for. No new asset added.
const programmeImage = {
  src: "/images/location/zenith-coast-03.JPG",
  alt: "A hiker overlooking the Atlantic coastline and mountains of Morocco",
};

export default function TheWeek() {
  const { eyebrow, heading, intro, activities } = siteContent.week;
  const [headingLead, headingRest] = heading.split("adventure");

  return (
    <section id="the-week" className="bg-warm-white">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32 lg:px-12 lg:py-32">
        <Reveal>
          <p className="font-body text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
            {eyebrow}
          </p>
          <h2 className="mt-6 max-w-2xl font-heading text-4xl font-semibold leading-[1.1] text-ocean-navy sm:text-5xl lg:text-6xl">
            {headingLead}
            <span className="font-accent font-normal italic text-terracotta">
              adventure
            </span>
            {headingRest}
          </h2>
          <p className="mt-6 max-w-xl font-body text-base leading-relaxed text-charcoal/70 sm:text-lg">
            {intro}
          </p>
        </Reveal>

        <div className="mt-14 lg:mt-16 lg:flex lg:flex-row-reverse lg:items-start lg:gap-12">
          {/* DOM-first so mobile shows it between the intro and the list;
              lg:flex-row-reverse puts it on the right visually, with the
              activity list taking the primary left position on desktop. */}
          <div className="lg:w-[36%]">
            <ImageReveal className="relative aspect-[4/5] w-full overflow-hidden">
              <Parallax>
                <Image
                  src={programmeImage.src}
                  alt={programmeImage.alt}
                  fill
                  sizes="(min-width: 1024px) 36vw, 100vw"
                  className="object-cover"
                />
              </Parallax>
            </ImageReveal>
          </div>

          <Reveal className="mt-10 lg:mt-0 lg:w-[56%]">
            <ol>
              {activities.map((activity, index) => (
                <li
                  key={activity.number}
                  className={index === 0 ? "" : "border-t border-charcoal/10"}
                >
                  <div className="flex items-baseline gap-4 py-3 lg:py-3.5">
                    <span className="font-heading text-4xl font-medium leading-none text-terracotta/35 tabular-nums sm:text-5xl">
                      {activity.number}
                    </span>
                    <div>
                      <h3 className="inline font-heading text-base font-semibold text-ocean-navy sm:text-lg">
                        {activity.title}
                      </h3>
                      <span className="font-body text-xs text-charcoal/50 sm:text-sm">
                        {" "}
                        — {activity.copy}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
