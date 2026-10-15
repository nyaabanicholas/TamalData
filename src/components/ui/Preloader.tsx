"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";

/**
 * Site-wide cinematic curtain.
 * - First visit per session: covered before first paint by the html[data-intro]
 *   script in app/layout.tsx, lifts after ~0.9s.
 * - Internal link clicks: curtain rises from the bottom while Next navigates in parallel,
 *   then lifts off the top once the new route has rendered.
 */

type Phase = "hidden" | "cover" | "reveal";

const COVER_MS = 520;
const REVEAL_MS = 700;
const HOLD_MS = 120;
const INTRO_MS = 900;
const STUCK_MS = 2500; // navigation cancelled, prevented, or redirected to same path

export function Preloader() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("hidden");
  const phaseRef = useRef<Phase>("hidden");
  const coverStart = useRef(0);
  const timers = useRef<number[]>([]);

  const go = (p: Phase) => {
    phaseRef.current = p;
    setPhase(p);
  };
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };

  // Intro + link interception
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const html = document.documentElement;

    if (html.dataset.intro) {
      go("cover");
      requestAnimationFrame(() => delete html.dataset.intro);
      later(() => go("reveal"), reduced ? 0 : INTRO_MS);
    }

    if (reduced) return clearTimers;

    const onClick = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || !a.href || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.pathname === location.pathname) return;
      if (url.pathname.startsWith("/api/")) return;

      clearTimers();
      coverStart.current = performance.now();
      go("cover");
      later(() => phaseRef.current === "cover" && go("reveal"), STUCK_MS);
    };

    // Capture phase: runs before Next <Link> calls preventDefault.
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      clearTimers();
    };
  }, []);

  // New route rendered → lift curtain once the cover has fully landed
  useEffect(() => {
    if (phaseRef.current !== "cover" || coverStart.current === 0) return;
    const wait = Math.max(0, coverStart.current + COVER_MS - performance.now()) + HOLD_MS;
    clearTimers();
    later(() => go("reveal"), wait);
  }, [pathname]);

  // Reset below the viewport after lifting, without animating back down
  useEffect(() => {
    if (phase !== "reveal") return;
    const t = window.setTimeout(() => {
      coverStart.current = 0;
      go("hidden");
    }, REVEAL_MS);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div className="page-curtain" data-phase={phase} aria-hidden="true">
      <div className="page-curtain-edge" />
      <div className="page-curtain-mark">
        <Image src="/logo.png" alt="" width={240} height={160} className="h-28 w-auto" priority />
      </div>
    </div>
  );
}
