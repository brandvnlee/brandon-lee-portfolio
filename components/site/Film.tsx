"use client";

import { useState } from "react";
import Image from "next/image";
import type { MediaAsset } from "@/lib/media.generated";

/**
 * The project film, held behind our own still until it is asked for.
 *
 * YouTube's placeholder cannot be trusted at this size. THE MANTRA has no HD
 * thumbnail, and for the sizes it does not have, YouTube serves a 120x90 grey
 * stub rather than a 404 — so at full width the player asked for
 * `maxresdefault`, got the stub, and stretched it across a 1324px frame. The
 * film read as broken before it had played a frame. Below about 500px the
 * player asks for a size that exists and it looked fine, which is why this only
 * showed up on a desktop.
 *
 * Serving the poster ourselves fixes that at the root, and pays twice more: the
 * still is one of the project's own frames at 2400px rather than a 640px
 * screengrab, and no third-party player, script or cookie is fetched until
 * someone actually wants to watch. The iframe mounts on click and starts
 * playing, so it is still one click to watch.
 */
export default function Film({
  id,
  title,
  poster,
}: {
  id: string;
  title: string;
  poster: MediaAsset;
}) {
  const [playing, setPlaying] = useState(false);

  if (playing) {
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}?rel=0&autoplay=1`}
        title={`${title} — film`}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
      />
    );
  }

  return (
    <button className="film" type="button" onClick={() => setPlaying(true)}>
      <Image
        src={poster.src}
        alt=""
        width={poster.width}
        height={poster.height}
        sizes="92vw"
        priority
      />
      {/* A hairline square around a triangle. A round button would be the one
          soft shape on a page built from rules and right angles. */}
      <span className="film__cue" aria-hidden="true">
        <svg viewBox="0 0 12 14" focusable="false">
          <path d="M0 0l12 7-12 7z" fill="currentColor" />
        </svg>
      </span>
      <span className="micro film__label">Play film</span>
    </button>
  );
}
