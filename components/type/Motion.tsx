"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { prefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

/**
 * Every scroll-driven animation on the site, in one controller. A single
 * listener and a single set of triggers, so the cadence cannot drift between
 * components.
 *
 * Choreographed per band rather than per element. Within a band the rule is
 * drawn first and the type arrives into a frame that already exists — if the
 * type lands first the rule reads as an underline appended to finished content,
 * and if they are simultaneous both dissolve into one soft fade and neither has
 * a role.
 */

/** Rule leads its type by this much. Long enough to register as its own event. */
const RULE_LEAD = 0.18;

/** Resting opacity of illuminated copy. Must match the CSS floor. */
const DIM = 0.24;

export default function Motion() {
  const pathname = usePathname();

  useEffect(() => {
    // Reduced motion still needs the end state applied, or the type that CSS
    // left dimmed would simply never arrive.
    if (prefersReducedMotion()) {
      gsap.set(".char, [data-split='illuminate'] .word", { opacity: 1 });
      gsap.set("[data-rule]", { scaleX: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      /* ------------------------------------------------------------------
         RULES

         Rules grow from their leading edge, always left origin: one that grows
         from the right or the centre reads as a UI transition.

         They also undraw when scrolled back past, so the line retracts the way
         it arrived rather than being permanently spent after one pass.

         scaleX rather than the width the reference animates: same read, stays
         on the compositor, and a 1px element with no children cannot distort.
         ------------------------------------------------------------------ */
      document.querySelectorAll<HTMLElement>("[data-rule]").forEach((el) => {
        gsap.fromTo(
          el,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 1,
            // Leaves fast, settles long. `inOut` would start slow, accelerate,
            // then decelerate, which reads as a wipe rather than a drawn line.
            ease: "expo.out",
            scrollTrigger: {
              trigger: el,
              start: "top 92%",
              toggleActions: "play none none reverse",
            },
          },
        );
      });

      /* ------------------------------------------------------------------
         DISPLAY TYPE — a single contact per character.

         One dip, not three, and it bottoms out at 0.45 rather than near zero.
         Repeated deep blinks read as a fault; one shallow contact reads as a
         panel taking power. The shallower floor and the wider stagger also
         keep the flashing area well under the WCAG 2.3.1 threshold, which
         matters now the titles are 300px of white on black — prefers-reduced-
         motion does not satisfy that criterion on its own.
         ------------------------------------------------------------------ */
      document.querySelectorAll<HTMLElement>('[data-split="enter"]').forEach((el) => {
        const chars = Array.from(el.querySelectorAll<HTMLElement>(".char"));
        if (!chars.length) return;

        const step = chars.length > 24 ? 1 / chars.length : 0.045;

        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          delay: RULE_LEAD,
        });

        chars.forEach((char, index) => {
          const at = index * step;
          tl.set(char, { opacity: 1 }, at)
            .set(char, { opacity: 0.45 }, at + 0.06)
            .set(char, { opacity: 1 }, at + 0.1);
        });

        // Holds the timeline open past the last cut so ScrollTrigger does not
        // consider it complete mid-contact.
        tl.to({}, { duration: 0.1 });
      });

      /* ------------------------------------------------------------------
         RUNNING COPY — brightens word by word, scrubbed against scroll.
         ------------------------------------------------------------------ */
      document
        .querySelectorAll<HTMLElement>('[data-split="illuminate"]')
        .forEach((el) => {
          const words = el.querySelectorAll(".word");
          if (!words.length) return;

          // `amount` spreads the stagger across a fixed span however many words
          // there are, so a short line and a long paragraph both finish
          // illuminating at the same point in their scroll range.
          gsap.fromTo(
            words,
            { opacity: DIM },
            {
              opacity: 1,
              ease: "none",
              duration: 0.4,
              stagger: { amount: 2.4 },
              scrollTrigger: {
                trigger: el,
                start: "top 85%",
                end: "bottom 55%",
                scrub: 0.35,
              },
            },
          );
        });
    });

    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, [pathname]);

  return null;
}
