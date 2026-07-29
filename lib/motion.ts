/**
 * One motion vocabulary for the whole site.
 *
 * These values are mirrored by custom properties in app/globals.css. Change
 * them in both places or the CSS transitions and the GSAP timelines will start
 * disagreeing with each other, which is the usual reason a site's motion feels
 * arbitrary rather than authored.
 */

export const dur = {
  fast: 0.4,
  base: 0.8,
  slow: 1.6,
} as const;

export const ease = {
  /** Entrances. Fast departure, long settle. */
  out: "expo.out",
  /** Type reveals. Slightly softer than `out` so letters do not snap. */
  type: "power4.out",
  /** Anything that leaves and returns. */
  inOut: "expo.inOut",
} as const;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
