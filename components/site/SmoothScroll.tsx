"use client";

import { useEffect, useRef } from "react";
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

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const instance = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95 });
    lenis.current = instance;

    instance.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const unregister = registerScrollToTop(() => {
      instance.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);
    });

    return () => {
      unregister();
      instance.off("scroll", ScrollTrigger.update);
      gsap.ticker.remove(raf);
      instance.destroy();
      lenis.current = null;
    };
  }, []);

  /**
   * Next resets the document scroll on navigation, but Lenis keeps its own
   * position and restores it on the next frame — so following "Next project"
   * opened the new page part way down. Both have to be reset together.
   *
   * Skipped on first mount, and skipped when there is a hash, so /#work still
   * lands on the index rather than at the top.
   */
  useEffect(() => {
    if (previous.current === pathname) return;

    const isFirstRender = previous.current === null;
    previous.current = pathname;
    if (isFirstRender || window.location.hash) return;

    lenis.current?.scrollTo(0, { immediate: true });
    window.scrollTo(0, 0);
    ScrollTrigger.refresh();
  }, [pathname]);

  return null;
}
