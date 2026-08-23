"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
  /** Tailwind translate class used for the hidden state. Defaults to the
   * standard 24px reveal distance; pass a smaller value (e.g.
   * "translate-y-4") for a softer, secondary-emphasis reveal. */
  distanceClass?: string;
  /** Render as a block "div" (default) or an inline-compatible "span" for
   * wrapping a fragment inside flowing text (e.g. one word of a heading). */
  as?: "div" | "span";
  /** Transition duration in ms. Defaults to 700ms (unchanged from before);
   * pass a different value to shorten/lengthen a specific instance. */
  durationMs?: number;
};

export default function Reveal({
  children,
  className = "",
  delayMs = 0,
  distanceClass = "translate-y-6",
  as = "div",
  durationMs = 700,
}: RevealProps) {
  const ref = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -10% 0px" }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const sharedClassName = `transition-[opacity,transform] ease-out motion-reduce:!translate-y-0 motion-reduce:!opacity-100 motion-reduce:transition-none ${
    isVisible ? "opacity-100 translate-y-0" : `opacity-0 ${distanceClass}`
  } ${as === "span" ? "inline-block" : ""} ${className}`;

  const sharedStyle = {
    transitionDuration: `${durationMs}ms`,
    transitionDelay: delayMs ? `${delayMs}ms` : undefined,
  };

  if (as === "span") {
    return (
      <span
        ref={ref as React.RefObject<HTMLSpanElement>}
        style={sharedStyle}
        className={sharedClassName}
      >
        {children}
      </span>
    );
  }

  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      style={sharedStyle}
      className={sharedClassName}
    >
      {children}
    </div>
  );
}
