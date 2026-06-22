"use client";

import Script from "next/script";
import { useEffect, useState, useRef } from "react";
import { MessageCircle } from "lucide-react";

const TAWK_PROPERTY_ID = "659f570b8d261e1b5f51bce7";
const TAWK_WIDGET_ID = "1hjr6o1jg";

declare global {
  interface Window {
    Tawk_API?: {
      hideWidget?: () => void;
      showWidget?: () => void;
      maximize?: () => void;
      onLoad?: () => void;
      onChatMinimized?: () => void;
    };
  }
}

export function TawkToWidget() {
  const [pos, setPos] = useState({ x: 16, y: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const [mounted, setMounted] = useState(false);
  const startRef = useRef({ px: 0, py: 0, ex: 0, ey: 0 });
  const posRef = useRef(pos);
  posRef.current = pos;

  useEffect(() => {
    setMounted(true);
    // Place above WhatsApp FAB (which sits at bottom-right ~80px from bottom)
    setPos(p => ({ ...p, y: window.innerHeight - 160 }));

    const setupTawk = () => {
      window.Tawk_API?.hideWidget?.();
      if (window.Tawk_API) {
        window.Tawk_API.onChatMinimized = () => {
          window.Tawk_API?.hideWidget?.();
        };
      }
    };

    window.Tawk_API = window.Tawk_API ?? {};
    if (typeof window.Tawk_API.hideWidget === "function") {
      setupTawk();
    } else {
      const prev = window.Tawk_API.onLoad;
      window.Tawk_API.onLoad = () => {
        prev?.();
        setupTawk();
      };
    }
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    startRef.current = { px: posRef.current.x, py: posRef.current.y, ex: e.clientX, ey: e.clientY };
    setIsDragging(true);
    setHasDragged(false);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const dx = e.clientX - startRef.current.ex;
    const dy = e.clientY - startRef.current.ey;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) setHasDragged(true);
    setPos({
      x: Math.max(8, Math.min(window.innerWidth - 64, startRef.current.px + dx)),
      y: Math.max(8, Math.min(window.innerHeight - 64, startRef.current.py + dy)),
    });
  };

  const onPointerUp = () => setIsDragging(false);

  const handleClick = () => {
    if (hasDragged) return;
    window.Tawk_API?.showWidget?.();
    window.Tawk_API?.maximize?.();
  };

  return (
    <>
      <Script
        strategy="lazyOnload"
        src={`https://embed.tawk.to/${TAWK_PROPERTY_ID}/${TAWK_WIDGET_ID}`}
      />
      {mounted && (
        <button
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onClick={handleClick}
          aria-label="Chat support"
          style={{
            position: "fixed",
            left: pos.x,
            top: pos.y,
            zIndex: 9998,
            touchAction: "none",
            cursor: isDragging ? "grabbing" : "grab",
            width: 56,
            height: 56,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #1A93C8 0%, #0D6B9A 100%)",
            border: "none",
            padding: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: isDragging
              ? "0 8px 24px rgba(0,0,0,0.28)"
              : "0 4px 14px rgba(0,0,0,0.20)",
            transform: isDragging ? "scale(1.08)" : "scale(1)",
            transition: isDragging
              ? "box-shadow 0.15s"
              : "box-shadow 0.2s, transform 0.2s",
          }}
        >
          <MessageCircle style={{ color: "white", width: 24, height: 24 }} strokeWidth={1.5} />
        </button>
      )}
    </>
  );
}
