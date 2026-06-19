"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Zap } from "lucide-react";

export function SystemStatusBar() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const fmt = () => {
      setTime(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    };
    fmt();
    const id = setInterval(fmt, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="liquid-glass rounded-xl px-5 py-3 flex flex-wrap items-center gap-4 text-xs font-barlow">
      {/* Live dot */}
      <span className="flex items-center gap-1.5">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-color-success opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-color-success" />
        </span>
        <span className="font-semibold text-color-success">System Online 24/7</span>
      </span>

      <span className="h-4 w-px bg-color-border" />

      <span className="flex items-center gap-1.5 text-text-muted">
        <Zap className="h-3.5 w-3.5 text-accent-primary" strokeWidth={1.5} />
        Fast delivery
      </span>

      <span className="flex items-center gap-1.5 text-text-muted">
        <ShieldCheck className="h-3.5 w-3.5 text-color-success" strokeWidth={1.5} />
        Secure payments
      </span>

      {time && (
        <>
          <span className="h-4 w-px bg-color-border" />
          <span className="ml-auto font-mono text-text-muted tabular-nums">{time}</span>
        </>
      )}
    </div>
  );
}
