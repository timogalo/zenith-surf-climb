import { INSTAGRAM_URL, WHATSAPP_URL } from "@/lib/social";

type SocialLinksProps = {
  className?: string;
  /** Full className for each <a> — include both structural (sizing) and
   * color/hover/focus classes; callers own this since Footer (dark bg)
   * and Booking (light bg) need different focus-ring offset colors. */
  linkClassName: string;
  iconClassName?: string;
};

const DEFAULT_ICON_CLASS = "h-[18px] w-[18px]";

// The <a> itself IS the touch target — a real 40x40px laid-out box (not an
// absolutely-positioned overlay), so it can never overlap its sibling: the
// container gap below is measured between these boxes' actual edges, with
// nothing invisible extending past them. No background/border is applied,
// so the extra box is fully transparent; only the icon inside is painted.
const TOUCH_TARGET_CLASS = "inline-flex h-10 w-10 shrink-0 items-center justify-center";

/**
 * Instagram + WhatsApp icon links, reused as-is (same icons, same URLs)
 * in the Footer and near the Booking section. Deliberately monochrome
 * (stroke="currentColor", no brand colors) and icon-only — the
 * accessible name comes entirely from each link's aria-label, not the
 * (decorative, aria-hidden) SVG.
 */
export default function SocialLinks({
  className = "",
  linkClassName,
  iconClassName = DEFAULT_ICON_CLASS,
}: SocialLinksProps) {
  return (
    <div className={`flex items-center gap-0 ${className}`}>
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Zenith Nomads on Instagram"
        className={`${TOUCH_TARGET_CLASS} ${linkClassName}`}
      >
        <InstagramIcon className={iconClassName} />
      </a>
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact Zenith Nomads on WhatsApp"
        className={`${TOUCH_TARGET_CLASS} ${linkClassName}`}
      >
        <WhatsAppIcon className={iconClassName} />
      </a>
    </div>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4.2" />
      <circle cx="17.1" cy="6.9" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 3a9 9 0 0 0-7.75 13.5L3 21l4.6-1.21A9 9 0 1 0 12 3Z" />
      <path
        d="M8.5 9.6c0 3.4 2.5 5.9 5.9 5.9.7 0 .95-.55.95-1.1v-.75c0-.28-.18-.5-.45-.58l-1.5-.47c-.27-.08-.46 0-.63.2l-.38.46a5.4 5.4 0 0 1-2.15-2.15l.46-.38c.2-.17.28-.36.2-.63l-.47-1.5c-.08-.27-.3-.45-.58-.45h-.75c-.55 0-1.1.25-1.1.95Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}
