/**
 * Lenis keeps its own scroll position, so anything that wants to jump the page
 * has to tell Lenis rather than the document — otherwise Lenis restores where it
 * was on the next frame. SmoothScroll registers the real implementation here;
 * everything else calls through this so it does not need a reference to the
 * instance.
 */

type Jump = () => void;

let jump: Jump | null = null;

export function registerScrollToTop(fn: Jump) {
  jump = fn;
  return () => {
    if (jump === fn) jump = null;
  };
}

/** Falls back to the document when Lenis is not running (reduced motion). */
export function scrollToTop() {
  if (jump) {
    jump();
    return;
  }
  window.scrollTo(0, 0);
}
