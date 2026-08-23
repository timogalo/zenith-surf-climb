"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { registerParallax } from "./parallaxController";

type ParallaxProps = {
  children: ReactNode;
};

/**
 * Subtle desktop-only scroll parallax for the image content inside an
 * ImageReveal (or any overflow-hidden) box. The outer layout box never
 * moves — only this inner layer translates, via the shared controller in
 * parallaxController.ts (one scroll listener for every registered image).
 */
export default function Parallax({ children }: ParallaxProps) {
  const measureRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const measureEl = measureRef.current;
    const targetEl = targetRef.current;
    if (!measureEl || !targetEl) return;
    return registerParallax(measureEl, targetEl);
  }, []);

  return (
    <div ref={measureRef} className="relative h-full w-full overflow-hidden">
      <div
        ref={targetRef}
        className="absolute inset-x-0 -top-6 -bottom-6 will-change-transform motion-reduce:!transform-none"
      >
        {children}
      </div>
    </div>
  );
}
