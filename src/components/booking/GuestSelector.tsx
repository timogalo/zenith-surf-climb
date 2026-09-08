"use client";

type GuestSelectorProps = {
  guests: number;
  onChange: (guests: number) => void;
};

export default function GuestSelector({ guests, onChange }: GuestSelectorProps) {
  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, guests - 1))}
        disabled={guests <= 1}
        aria-label="Decrease guest count"
        className="flex h-9 w-9 items-center justify-center border border-ocean-navy/25 font-heading text-lg text-ocean-navy transition-colors hover:border-terracotta hover:text-terracotta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-navy focus-visible:ring-offset-2 focus-visible:ring-offset-warm-sand disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-ocean-navy/25 disabled:hover:text-ocean-navy"
      >
        −
      </button>
      <span
        aria-live="polite"
        className="min-w-[3ch] text-center font-heading text-lg text-ocean-navy"
      >
        {guests} {guests === 1 ? "guest" : "guests"}
      </span>
      <button
        type="button"
        onClick={() => onChange(guests + 1)}
        aria-label="Increase guest count"
        className="flex h-9 w-9 items-center justify-center border border-ocean-navy/25 font-heading text-lg text-ocean-navy transition-colors hover:border-terracotta hover:text-terracotta focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-navy focus-visible:ring-offset-2 focus-visible:ring-offset-warm-sand"
      >
        +
      </button>
    </div>
  );
}
