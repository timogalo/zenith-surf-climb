import Link from "next/link";
import LogoutButton from "./LogoutButton";

type AdminSection = "bookings" | "availability" | "settings";

const LINKS: Array<{ key: AdminSection; label: string; href: string }> = [
  { key: "bookings", label: "Bookings", href: "/admin" },
  { key: "availability", label: "Availability", href: "/admin/availability" },
  { key: "settings", label: "Settings", href: "/admin/settings" },
];

export default function AdminNav({ active }: { active: AdminSection }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4 border-b border-ocean-navy/10 pb-6">
      <div>
        <p className="font-body text-xs uppercase tracking-[0.14em] text-ocean-navy/45">
          Zenith Nomads
        </p>
        <nav aria-label="Admin" className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
          {LINKS.map((link) => {
            const isActive = link.key === active;
            return (
              <Link
                key={link.key}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`font-heading text-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-navy focus-visible:ring-offset-2 focus-visible:ring-offset-warm-white ${
                  isActive ? "text-ocean-navy" : "text-ocean-navy/40 hover:text-ocean-navy/70"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <LogoutButton />
    </div>
  );
}
