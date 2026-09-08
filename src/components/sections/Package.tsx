import { siteContent } from "@/data/content";
import Reveal from "@/components/motion/Reveal";

export default function Package() {
  const { eyebrow, heading, body, price, priceNote, schedule, included, cta } =
    siteContent.package;

  return (
    <section id="package" className="bg-ocean-navy">
      <div className="mx-auto max-w-7xl px-6 py-24 sm:px-8 sm:py-32 lg:px-12 lg:py-32">
        <div className="lg:flex lg:items-start lg:justify-between lg:gap-16">
          <Reveal className="lg:w-[42%]">
            <p className="font-body text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
              {eyebrow}
            </p>
            <h2 className="mt-6 max-w-md font-heading text-4xl font-semibold leading-[1.1] text-warm-white sm:text-5xl lg:text-6xl">
              {heading}
            </h2>
            <p className="mt-6 max-w-sm font-body text-base leading-relaxed text-warm-white/70 sm:text-lg">
              {body}
            </p>

            <div className="mt-12">
              <span className="font-heading text-6xl font-semibold text-warm-white sm:text-7xl">
                {price}
              </span>
              <p className="mt-2 font-body text-sm uppercase tracking-[0.14em] text-warm-white/50">
                {priceNote}
              </p>
              <p className="mt-4 font-body text-xs font-medium uppercase tracking-[0.2em] text-terracotta">
                {schedule}
              </p>
            </div>

            <a
              href={cta.href}
              className="group mt-10 inline-flex items-center gap-2 rounded-full bg-terracotta px-7 py-3.5 font-body text-sm font-medium tracking-wide text-warm-white transition-[color,background-color,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-[1.015] hover:bg-terracotta/90 active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-white focus-visible:ring-offset-2 focus-visible:ring-offset-ocean-navy motion-reduce:transition-none motion-reduce:hover:scale-100 motion-reduce:active:scale-100"
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

          <Reveal delayMs={100} className="mt-14 lg:mt-0 lg:w-[50%]">
            <ul className="border-t border-warm-white/10">
              {included.map((item) => (
                <li
                  key={item.label}
                  className="flex flex-col gap-1.5 border-b border-warm-white/10 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                >
                  <span className="shrink-0 font-body text-xs font-medium uppercase tracking-[0.2em] text-terracotta sm:w-36">
                    {item.label}
                  </span>
                  <span className="font-body text-sm leading-relaxed text-warm-white/85 sm:text-right sm:text-base">
                    {item.value}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
