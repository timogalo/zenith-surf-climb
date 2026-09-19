"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type FocusEvent,
  type KeyboardEvent,
  type TouchEvent,
} from "react";
import ImageReveal from "@/components/motion/ImageReveal";

export type ProgramCarouselPhoto = {
  src: string;
  alt: string;
  /** Only set for a photo whose native aspect ratio needs a non-center crop. */
  objectPosition?: string;
};

type ProgramCarouselProps = {
  images: ProgramCarouselPhoto[];
  /** The full image-box className (including "relative", the aspect
   * ratio, width and overflow-hidden) — passed straight through to
   * ImageReveal exactly as the static image it replaces did, so the
   * caller keeps full control of the container's dimensions/position. */
  imageBoxClassName: string;
  sizes: string;
};

const AUTOPLAY_INTERVAL_MS = 5000;
const TRANSITION_MS = 900;
const SWIPE_THRESHOLD_PX = 40;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function mod(n: number, m: number): number {
  return ((n % m) + m) % m;
}

// useSyncExternalStore rather than a useEffect+setState pair: reading
// matchMedia synchronously inside an effect body is a set-state-in-effect
// lint violation, and — same reasoning as the visitor-date handling in
// src/lib/weeks.ts — naively setting it from an effect would also risk a
// hydration mismatch if the visitor's actual preference differs from the
// server-rendered default. The server snapshot always reports `false`
// (matching what SSR renders); the client swaps to the real value
// immediately after hydration with no cascading render.
function subscribeToReducedMotion(callback: () => void): () => void {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", callback);
  return () => query.removeEventListener("change", callback);
}
function getReducedMotionSnapshot(): boolean {
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}
function getReducedMotionServerSnapshot(): boolean {
  return false;
}

/**
 * Calm, cinematic crossfade carousel for the TheWeek programme photos.
 * No carousel library — the interaction (autoplay, crossfade, swipe,
 * pause-on-interaction) is simple enough to hand-roll, per the brief.
 *
 * Composition mirrors the single static image it replaces, minus Parallax:
 * ImageReveal (one-time entrance mask) wraps the crossfading image stack
 * plus the arrow/indicator overlay. Parallax was deliberately dropped here
 * (kept everywhere else on the site unchanged) — a continuous scroll-linked
 * shift layered on top of an autoplaying crossfade made the box feel busier
 * than the calm, cinematic result this section is meant to have. The
 * progress dots live outside ImageReveal entirely, since that box is
 * aspect-ratio + overflow-hidden and would clip anything taller than the
 * photo itself.
 *
 * THE CROSSFADE ITSELF: a photo shown for the first time cannot be trusted
 * to fade in just by rendering it with opacity-100 on the same pass that
 * mounts it — the browser has no earlier "opacity-0" paint to transition
 * from, so it simply appears instantly (this was the original bug: the
 * *outgoing* photo always faded correctly, since it already existed with a
 * real opacity-100 paint behind it, but the *incoming* one never visibly
 * faded in on its first appearance). `scheduleTransitionTo` fixes this by
 * mounting the target photo first (still at opacity-0) and only flipping
 * it to "active" after two nested requestAnimationFrame callbacks — the
 * same double-rAF technique already used in ImageReveal.tsx to guarantee a
 * real paint has happened before animating away from it. Every transition
 * goes through this one path (autoplay tick, arrows, dots, swipe, keyboard)
 * so they all crossfade identically.
 *
 * Restarting the autoplay interval on every index change (whether from
 * autoplay's own tick or a manual interaction) is what naturally gives
 * "don't auto-advance immediately after a manual interaction" — see the
 * effect below. Only one interval ever exists at a time.
 */
export default function ProgramCarousel({
  images,
  imageBoxClassName,
  sizes,
}: ProgramCarouselProps) {
  const count = images.length;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mountedIndices, setMountedIndices] = useState<Set<number>>(() => new Set([0]));
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isDocumentHidden, setIsDocumentHidden] = useState(false);
  const prefersReducedMotion = useSyncExternalStore(
    subscribeToReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
  const touchStartXRef = useRef<number | null>(null);
  const pendingFramesRef = useRef<number[]>([]);

  useEffect(() => {
    const handleVisibilityChange = () => setIsDocumentHidden(document.hidden);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  useEffect(() => {
    // Intentionally reads pendingFramesRef.current inside the cleanup
    // itself, not a copy captured here — frame ids are pushed onto this
    // ref continuously as the carousel is used, and only the list as it
    // stands at actual unmount time should be cancelled.
    return () => {
      // eslint-disable-next-line react-hooks/exhaustive-deps
      pendingFramesRef.current.forEach((id) => cancelAnimationFrame(id));
    };
  }, []);

  const scheduleTransitionTo = useCallback(
    (targetIndex: number) => {
      const next = mod(targetIndex, count);
      setMountedIndices((prev) => (prev.has(next) ? prev : new Set(prev).add(next)));
      // Two nested frames: the first lets the browser commit the newly
      // mounted (opacity-0) photo; the second flips it active, so the
      // opacity/scale change is a genuine transition rather than an
      // instant pop-in. Harmless — just a couple of extra milliseconds —
      // for a photo that was already mounted from an earlier visit.
      const firstFrame = requestAnimationFrame(() => {
        const secondFrame = requestAnimationFrame(() => {
          setCurrentIndex(next);
        });
        pendingFramesRef.current.push(secondFrame);
      });
      pendingFramesRef.current.push(firstFrame);
    },
    [count]
  );

  const isPaused = isHovered || isFocused || isDocumentHidden;

  // Re-armed on every index change (see file comment) — the sole timer.
  useEffect(() => {
    if (isPaused || prefersReducedMotion || count <= 1) return;
    const id = setInterval(() => {
      scheduleTransitionTo(currentIndex + 1);
    }, AUTOPLAY_INTERVAL_MS);
    return () => clearInterval(id);
  }, [currentIndex, isPaused, prefersReducedMotion, count, scheduleTransitionTo]);

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const startX = touchStartXRef.current;
    touchStartXRef.current = null;
    if (startX === null) return;
    const endX = event.changedTouches[0]?.clientX ?? startX;
    const deltaX = endX - startX;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;
    scheduleTransitionTo(currentIndex + (deltaX < 0 ? 1 : -1));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scheduleTransitionTo(currentIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      scheduleTransitionTo(currentIndex + 1);
    }
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsFocused(false);
    }
  }

  const transitionStyle = { transitionDuration: `${TRANSITION_MS}ms` };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <ImageReveal className={imageBoxClassName}>
        {images.map((image, index) => {
          const isActive = index === currentIndex;
          if (!mountedIndices.has(index)) return null;
          return (
            <div
              key={image.src}
              aria-hidden={!isActive}
              style={transitionStyle}
              className={`absolute inset-0 transition-opacity ease-in-out motion-reduce:transition-none ${
                isActive ? "opacity-100" : "opacity-0"
              }`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes={sizes}
                style={
                  image.objectPosition
                    ? { ...transitionStyle, objectPosition: image.objectPosition }
                    : transitionStyle
                }
                className={`object-cover transition-transform ease-in-out motion-reduce:!scale-100 motion-reduce:transition-none ${
                  isActive ? "scale-100" : "scale-[1.015]"
                }`}
              />
            </div>
          );
        })}

        <button
          type="button"
          onClick={() => scheduleTransitionTo(currentIndex - 1)}
          aria-label="Previous photo"
          className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-warm-white/80 text-ocean-navy backdrop-blur-[2px] transition-colors hover:bg-warm-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-navy focus-visible:ring-offset-2 focus-visible:ring-offset-warm-white sm:left-4"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M9.5 4l-4 4 4 4" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => scheduleTransitionTo(currentIndex + 1)}
          aria-label="Next photo"
          className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-warm-white/80 text-ocean-navy backdrop-blur-[2px] transition-colors hover:bg-warm-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-navy focus-visible:ring-offset-2 focus-visible:ring-offset-warm-white sm:right-4"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="M6.5 4l4 4-4 4" />
          </svg>
        </button>

        <div className="absolute bottom-3 right-3 z-10 rounded-full bg-charcoal/35 px-2.5 py-1 backdrop-blur-[2px]">
          <span className="font-body text-[11px] font-medium tabular-nums tracking-[0.08em] text-warm-white">
            {String(currentIndex + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </span>
        </div>
      </ImageReveal>

      <div
        role="tablist"
        aria-label="Programme photo progress"
        className="mt-4 flex items-center gap-2"
      >
        {images.map((image, index) => (
          <button
            key={image.src}
            type="button"
            role="tab"
            aria-selected={index === currentIndex}
            aria-label={`Show photo ${index + 1} of ${count}`}
            onClick={() => scheduleTransitionTo(index)}
            className={`h-[2px] w-5 rounded-full transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ocean-navy focus-visible:ring-offset-2 focus-visible:ring-offset-warm-white ${
              index === currentIndex ? "bg-terracotta" : "bg-ocean-navy/25"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
