type ParallaxEntry = {
  measureEl: HTMLElement;
  targetEl: HTMLElement;
};

const entries = new Set<ParallaxEntry>();

/** Total vertical travel range applied is TRAVEL_PX * 2 (±TRAVEL_PX). */
const TRAVEL_PX = 20;

let scrollBound = false;
let ticking = false;

function isEligible(): boolean {
  if (typeof window === "undefined") return false;
  const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  return isDesktop && !prefersReducedMotion;
}

function update() {
  ticking = false;

  if (!isEligible()) {
    entries.forEach(({ targetEl }) => {
      targetEl.style.transform = "";
    });
    return;
  }

  const viewportHeight = window.innerHeight;

  // Batch all layout reads first, then all style writes, to avoid
  // interleaved read/write layout thrashing.
  const writes: Array<[HTMLElement, string]> = [];

  entries.forEach(({ measureEl, targetEl }) => {
    const rect = measureEl.getBoundingClientRect();
    const progress =
      (viewportHeight - rect.top) / (viewportHeight + rect.height);
    const clamped = Math.min(1, Math.max(0, progress));
    const offset = (clamped - 0.5) * TRAVEL_PX * 2;
    writes.push([targetEl, `translate3d(0, ${offset.toFixed(1)}px, 0)`]);
  });

  writes.forEach(([el, transform]) => {
    el.style.transform = transform;
  });
}

function onScrollOrResize() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(update);
}

function ensureListening() {
  if (scrollBound) return;
  scrollBound = true;
  window.addEventListener("scroll", onScrollOrResize, { passive: true });
  window.addEventListener("resize", onScrollOrResize, { passive: true });
}

function teardownListening() {
  if (!scrollBound) return;
  scrollBound = false;
  window.removeEventListener("scroll", onScrollOrResize);
  window.removeEventListener("resize", onScrollOrResize);
}

/**
 * Registers one element pair with the shared parallax controller. A single
 * scroll/resize listener drives every registered image, rather than each
 * image owning its own listener. Returns an unregister function.
 */
export function registerParallax(
  measureEl: HTMLElement,
  targetEl: HTMLElement
): () => void {
  const entry: ParallaxEntry = { measureEl, targetEl };
  entries.add(entry);
  ensureListening();
  update();

  return () => {
    entries.delete(entry);
    if (entries.size === 0) {
      teardownListening();
    }
  };
}
