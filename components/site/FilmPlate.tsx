"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * A clip laid out as a plate: silent, looping, no chrome.
 *
 * It plays on JavaScript rather than on the `autoplay` attribute, which buys two
 * things. Reduced motion is honoured — the poster simply stays, and a still frame
 * of the same shot is a fair substitute rather than a degraded one. And playback
 * follows the viewport, so a clip near the foot of a long page is not decoding
 * while the reader is still at the top of it.
 */
export default function FilmPlate({
  src,
  poster,
  width,
  height,
}: {
  src: string;
  poster: string;
  width: number;
  height: number;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video || prefersReducedMotion()) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { rootMargin: "300px" },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      width={width}
      height={height}
      muted
      loop
      playsInline
      preload="metadata"
    />
  );
}
