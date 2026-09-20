import { siteContent } from "@/data/content";
import SocialLinks from "@/components/ui/SocialLinks";

const SOCIAL_LINK_CLASS =
  "inline-flex text-warm-white/70 transition-colors hover:text-terracotta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-white focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal";

export default function Footer() {
  const { name, tagline } = siteContent.brand;
  const { links } = siteContent.nav;
  const year = new Date().getFullYear();

  return (
    <footer className="bg-charcoal text-warm-white">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-12">
        <div className="flex flex-col gap-10 border-b border-warm-white/10 pb-10 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="font-heading text-xl font-semibold">{name}</p>
            <p className="mt-2 max-w-xs font-body text-sm text-warm-white/60">
              {tagline}
            </p>
          </div>

          <nav aria-label="Footer">
            <ul className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-x-10 sm:gap-y-3">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="font-body text-sm font-medium text-warm-white/80 transition-colors hover:text-warm-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warm-white focus-visible:ring-offset-2 focus-visible:ring-offset-charcoal"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body text-xs text-warm-white/50">
            © {year} {name}
          </p>
          <SocialLinks linkClassName={SOCIAL_LINK_CLASS} />
        </div>
      </div>
    </footer>
  );
}
