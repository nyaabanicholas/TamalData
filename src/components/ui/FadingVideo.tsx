"use client";

import { useEffect, useRef } from "react";

const FADE_MS = 500;
const FADE_OUT_LEAD = 0.55; // seconds before end to start fading out

type Props = {
  src: string;
  className?: string;
  style?: React.CSSProperties;
  poster?: string;
};

/**
 * Background video with JS-driven (rAF) crossfade looping.
 * No CSS transitions — each fade resumes from the current opacity so
 * rapid loops never hard-cut. Manual loop via the `ended` event.
 */
export function FadingVideo({ src, className, style, poster }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const fadingOutRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Reduced motion: show a static first frame, no fade loop.
    if (prefersReduced) {
      video.style.opacity = "1";
      video.removeAttribute("autoplay");
      return;
    }

    const fadeTo = (target: number, duration: number) => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      const start = parseFloat(video.style.opacity || "0");
      const delta = target - start;
      let startTs: number | null = null;

      const step = (ts: number) => {
        if (startTs === null) startTs = ts;
        const progress = Math.min((ts - startTs) / duration, 1);
        video.style.opacity = String(start + delta * progress);
        if (progress < 1) {
          rafRef.current = requestAnimationFrame(step);
        } else {
          rafRef.current = null;
        }
      };
      rafRef.current = requestAnimationFrame(step);
    };

    const onLoadedData = () => {
      video.style.opacity = "0";
      video.play().catch(() => {});
      fadeTo(1, FADE_MS);
    };

    const onTimeUpdate = () => {
      const remaining = video.duration - video.currentTime;
      if (!fadingOutRef.current && remaining <= FADE_OUT_LEAD && remaining > 0) {
        fadingOutRef.current = true;
        fadeTo(0, FADE_MS);
      }
    };

    const onEnded = () => {
      video.style.opacity = "0";
      setTimeout(() => {
        video.currentTime = 0;
        video.play().catch(() => {});
        fadingOutRef.current = false;
        fadeTo(1, FADE_MS);
      }, 100);
    };

    video.addEventListener("loadeddata", onLoadedData);
    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended", onEnded);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      video.removeEventListener("loadeddata", onLoadedData);
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended", onEnded);
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      src={src}
      poster={poster}
      autoPlay
      muted
      playsInline
      preload="none"
      aria-hidden="true"
      className={className}
      style={{ opacity: 0, ...style }}
    />
  );
}
