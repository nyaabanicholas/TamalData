"use client";

import { useEffect, useRef } from "react";

const FADE_MS = 500;
const FADE_OUT_LEAD = 0.55; // seconds before end to start fading out
const LOOP_FLOOR = 0.35; // dip opacity at loop seam instead of cutting to black

type Props = {
  src: string;
  className?: string;
  style?: React.CSSProperties;
  poster?: string;
};

/**
 * Background video with rAF crossfade at the loop seam.
 * Poster shows immediately (no black flash); playback pauses while offscreen
 * so off-viewport videos stop eating GPU/decoder time.
 */
export function FadingVideo({ src, className, style, poster }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.pause();
      return;
    }

    let raf: number | null = null;
    let fadingOut = false;
    let visible = false;

    const fadeTo = (target: number) => {
      if (raf !== null) cancelAnimationFrame(raf);
      const start = parseFloat(video.style.opacity || "1");
      let t0: number | null = null;
      const step = (ts: number) => {
        t0 ??= ts;
        const p = Math.min((ts - t0) / FADE_MS, 1);
        video.style.opacity = String(start + (target - start) * p);
        raf = p < 1 ? requestAnimationFrame(step) : null;
      };
      raf = requestAnimationFrame(step);
    };

    const onTimeUpdate = () => {
      const remaining = video.duration - video.currentTime;
      if (!fadingOut && remaining <= FADE_OUT_LEAD && remaining > 0) {
        fadingOut = true;
        fadeTo(LOOP_FLOOR);
      }
    };

    const onEnded = () => {
      video.currentTime = 0;
      if (visible) video.play().catch(() => {});
      fadingOut = false;
      fadeTo(1);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) video.play().catch(() => {});
        else video.pause();
      },
      { rootMargin: "200px" }
    );
    io.observe(video);

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);

    return () => {
      io.disconnect();
      if (raf !== null) cancelAnimationFrame(raf);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      muted
      playsInline
      preload="metadata"
      aria-hidden="true"
      className={className}
      style={{ willChange: "opacity", ...style }}
    />
  );
}
