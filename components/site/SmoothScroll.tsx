"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";
import { registerScrollToTop } from "@/lib/scroll";

gsap.registerPlugin(ScrollTrigger);

/**
 * Smooth scroll for the whole document. Lenis drives the real scroll position
 * rather than transforming a wrapper, so native scroll events still fire and
 * anything measuring window.scrollY keeps working.
 *
 * Lenis is driven by GSAP's ticker instead of its own requestAnimationFrame
 * loop. Two independent loops would sample the scroll position at slightly
 * different moments each frame, which shows up as scrubbed animations jittering
 * against the content they are pinned to.
 */
export default function SmoothScroll() {
  const pathname = usePathname();
  const lenis = useRef<Lenis | null>(null);
  const previous = useRef<string | null>(null);

  /** Puts the document and Lenis at the top together, in that order. */
  const toTop = useCallback(() => {
    // `force` because Lenis ignores a scrollTo while it considers itself
    // stopped or prevented, which is the state it is in mid-navigation.
    lenis.current?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
  }, []);

  /**
   * The browser restores the scroll position of a history entry on its own, a
   * frame or two after the entry becomes current — which is to say after this
   * component has already put the page at the top. It was the last writer, and
   * that is why a page you had already visited opened part way down it.
   *
   * Worse, it moves the document without telling Lenis, which still believed it
   * was at the top: the next touch of the wheel snapped the page back up. Both
   * symptoms are the same cause, and taking restoration away from the browser
   * leaves this component as the only thing deciding where a page opens.
   *
   * On every render rather than once on mount, because the mode is a property
   * of the session history ENTRY and not of the document: every navigation
   * starts a new entry at the browser's default, so an entry has to be marked
   * while it is current or it will restore when it is returned to. It is one
   * property write.
   */
  useEffect(() => {
    history.scrollRestoration = "manual";
  });

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const instance = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95 });
    lenis.current = instance;

    instance.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const unregister = registerScrollToTop(toTop);

    return () => {
      unregister();
      instance.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(raf);
      instance.destroy();
      lenis.current = null;
    };
  }, [toTop]);

  /**
   * Every route change opens at the top. Next resets the document scroll on a
   * forward navigation but not on a back or forward through history, and Lenis
   * keeps its own position through both, so neither can be left to do it.
   *
   * Twice: once now, and once on the next frame. The page that is arriving is
   * mostly images, so its height is still settling as they resolve, and a
   * height change while the document is scrolled moves the scroll with it. The
   * second pass costs nothing — by then it is almost always already at zero.
   *
   * Skipped on first mount, and skipped when there is a hash, so /#work still
   * lands on the index rather than at the top.
   *
   * No ScrollTrigger.refresh() here. Motion rebuilds its triggers on the same
   * pathname change and refreshes once they exist, and it runs after this — two
   * refreshes was two full measurements of a page eleven thousand pixels tall,
   * at the one moment the browser is already busy decoding its images.
   */
  useEffect(() => {
    if (previous.current === pathname) return;

    const isFirstRender = previous.current === null;
    previous.current = pathname;
    if (isFirstRender || window.location.hash) return;

    toTop();
    const settle = requestAnimationFrame(toTop);
    return () => cancelAnimationFrame(settle);
  }, [pathname, toTop]);

  return null;
}
