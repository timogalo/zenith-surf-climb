"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type ImageRevealProps = {
  children: ReactNode;
  /** Layout classes for the static outer box (position, aspect ratio,
   * width, overflow-hidden, offsets, grid span, etc). Passed through
   * unchanged — this component never affects outer layout dimensions. */
  className?: string;
  delayMs?: number;
  /** Direction the mask retracts toward. "up" (default) reveals from the
   * bottom edge upward; "left" reveals from the left edge rightward; "right"
   * is the mirror of "left" (reveals from the right edge leftward). */
  direction?: "up" | "left" | "right";
  /** Reveal transition duration in ms. Defaults to 820ms; pass a shorter
   * value (e.g. 680) for a lighter, quieter reveal such as Gallery. */
  durationMs?: number;
  /** Initial scale before reveal, as a literal string (kept as a small
   * fixed set of Tailwind-safe values rather than an arbitrary number, so
   * the reduced-motion override stays purely class-driven). Defaults to
   * "1.03"; pass "1.02" for a slightly quieter scale-in. */
  scaleFrom?: "1.02" | "1.03";
};

const DEFAULT_DURATION_MS = 820;

const hiddenClipPathClasses: Record<"up" | "left" | "right", string> = {
  up: "[clip-path:inset(100%_0_0_0)]",
  left: "[clip-path:inset(0_100%_0_0)]",
  right: "[clip-path:inset(0_0_0_100%)]",
};

const hiddenScaleClasses: Record<"1.02" | "1.03", string> = {
  "1.02": "scale-[1.02]",
  "1.03": "scale-[1.03]",
};

const revealedStateClasses = "[clip-path:inset(0_0_0_0)] scale-100";

export default function ImageReveal({
  children,
  className = "",
  delayMs = 0,
  direction = "up",
  durationMs = DEFAULT_DURATION_MS,
  scaleFrom = "1.03",
}: ImageRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    let cancelled = false;
    let observer: IntersectionObserver | null = null;

    // Defer past two animation frames before taking any measurement or
    // attaching the observer. Some layouts (e.g. a box sized via an
    // ancestor's aspect-ratio + CSS Grid stretch, rather than its own
    // aspect-ratio) can still report a zero/collapsed rect on the very
    // first read after mount, before the browser has fully settled that
    // derived geometry. IntersectionObserver only fires on threshold
    // *crossings* — a bad first reading with no later scroll/resize can
    // leave isVisible stuck false forever. Waiting for a real paint avoids
    // taking that first reading too early in the first place.
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (cancelled) return;

        const rect = node.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const alreadyInTriggerZone =
          rect.height > 0 && rect.top < viewportHeight * 1.1 && rect.bottom > 0;

        // Belt-and-suspenders: if the element already has real size and
        // already sits in (or is about to enter) the viewport by the time
        // we check, reveal it immediately rather than depending on an
        // observer callback that may never come again.
        if (alreadyInTriggerZone) {
          setIsVisible(true);
          return;
        }

        observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              observer?.unobserve(node);
            }
          },
          { threshold: 0.1, rootMargin: "0px 0px 10% 0px" }
        );
        observer.observe(node);
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      observer?.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      <div
        style={{
          transitionDuration: `${durationMs}ms`,
          transitionDelay: delayMs ? `${delayMs}ms` : undefined,
        }}
        className={`absolute inset-0 origin-center transition-[clip-path,transform] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:![clip-path:inset(0_0_0_0)] motion-reduce:!scale-100 motion-reduce:transition-none ${
          isVisible
            ? revealedStateClasses
            : `${hiddenClipPathClasses[direction]} ${hiddenScaleClasses[scaleFrom]}`
        }`}
      >
        {children}
      </div>
    </div>
  );
}
