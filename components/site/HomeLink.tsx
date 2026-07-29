"use client";

import Link from "next/link";
import { scrollToTop } from "@/lib/scroll";

/**
 * The index link always lands at the top of the page.
 *
 * Navigating from a case page already resets the scroll, but clicking Index
 * while you are on the index is not a navigation at all — the route does not
 * change, so nothing resets and the click appeared to do nothing. This jumps
 * explicitly, which covers both cases.
 */
export default function HomeLink({ className }: { className?: string }) {
  return (
    <Link
      className={className}
      href="/"
      aria-label="Index, home"
      onClick={() => scrollToTop()}
    >
      Index
    </Link>
  );
}
