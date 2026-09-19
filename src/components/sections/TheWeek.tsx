import { siteContent } from "@/data/content";
import Reveal from "@/components/motion/Reveal";
import ProgramCarousel, {
  type ProgramCarouselPhoto,
} from "@/components/ui/ProgramCarousel";

// Curated from the client's public/images/program/ set (9 photos). Per
// client feedback, this carousel now deliberately re-uses five photos that
// also appear as a dedicated static-section image elsewhere (Surf, Climb,
// Create, and FinalCTA) — an intentional exception to the site-wide
// no-duplicate rule: the client specifically wants a richer overview of
// Program photography here, and a photo legitimately belongs both to its
// own dedicated section AND to this "moments from the whole week" summary.
// zenith-coast-03.JPG still does not appear here — that exception is only
// for the new Program photography, not the original location/ set.
//
// One of the nine (06b297b3, the tight spice-cone close-up) was left out
// deliberately: it's the most similar in spirit to IMG_5354's wider souk
// shot, which tells the "market" moment with more context, and leaving out
// one photo — rather than reflexively including all nine — keeps this an
// edited sequence, not just the whole folder.
//
// Sequenced to alternate energy and subject rather than grouping similar
// shots: ocean → hospitality → mountains → food → nature → market →
// a quieter reflective beat → a dramatic closing moment. The two
// tea/hospitality shots and the two rock/nature shots are each kept well
// apart rather than adjacent.
const programmePhotos: ProgramCarouselPhoto[] = [
  {
    src: "/images/program/7B4E241F-9231-4258-B246-3A01439A101A_VSCO.jpg",
    alt: "A row of colourful surfboards leaning against a vintage van on a sunny beach",
  },
  {
    src: "/images/program/IMG_2885_VSCO.jpg",
    alt: "A hand pouring traditional Moroccan tea on a rooftop terrace at golden hour",
  },
  {
    src: "/images/program/IMG_5043.JPG",
    alt: "A hiker standing atop a large rock formation in the Moroccan mountains",
  },
  {
    src: "/images/program/8902f83f-ea4f-4f0b-bb84-628ef420b54b.jpg",
    alt: "A traditional Moroccan breakfast table with mint tea glasses and ornate ceramics",
    // Source photo is notably wider (1.5:1) than this box's 4:5 portrait
    // ratio; biasing left keeps both the teapot and the pitcher on the
    // left in frame rather than a pure-center crop pushing the pitcher out.
    objectPosition: "42% 50%",
  },
  {
    src: "/images/program/IMG_7247_VSCO.jpg",
    alt: "A small waterfall flowing into a rocky natural pool",
  },
  {
    src: "/images/program/IMG_5354.JPG",
    alt: "Sacks of colourful spices and market goods at a Moroccan souk stall",
  },
  {
    src: "/images/program/IMG_7264_VSCO.jpg",
    alt: "Looking up through an eroded rock opening at bare branches against the sky",
  },
  {
    src: "/images/program/IMG_7325.JPG",
    alt: "Three people practising yoga on mats along a dramatic red-rock cliff edge",
  },
];

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
            <ProgramCarousel
              images={programmePhotos}
              imageBoxClassName="relative aspect-[4/5] w-full overflow-hidden"
              sizes="(min-width: 1024px) 36vw, 100vw"
            />
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
