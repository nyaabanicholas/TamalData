import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // All reference CSS variables — light/dark handled in globals.css
        "bg-base":      "var(--bg-base)",
        "bg-surface":   "var(--bg-surface)",
        "bg-elevated":  "var(--bg-elevated)",
        "accent-primary":  "var(--accent-primary)",
        "accent-glow":     "var(--accent-glow)",
        "accent-orange":   "var(--accent-orange)",
        "accent-cyan":     "var(--accent-cyan)",
        "text-primary":    "var(--text-primary)",
        "text-secondary":  "var(--text-secondary)",
        "text-muted":      "var(--text-muted)",
        "color-success":   "var(--color-success)",
        "color-warning":   "var(--color-warning)",
        "color-error":     "var(--color-error)",
        "color-border":    "var(--color-border)",
      },
      fontFamily: {
        display: ["var(--font-space-grotesk)", "sans-serif"],
        body:    ["var(--font-body-barlow)", "var(--font-inter)", "sans-serif"],
        mono:    ["var(--font-jetbrains-mono)", "monospace"],
        heading: ["var(--font-heading)", "serif"],
        barlow:  ["var(--font-body-barlow)", "sans-serif"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "1rem" }],
      },
      spacing: {
        "section-desktop": "120px",
        "section-mobile":  "64px",
      },
      maxWidth: {
        content: "1280px",
      },
      borderRadius: {
        card:  "16px",
        btn:   "12px",
        input: "10px",
      },
      backgroundImage: {
        "hero-gradient": "var(--gradient-hero)",
        "cta-gradient":  "linear-gradient(90deg, #009DF9 0%, #FE8E01 100%)",
      },
      keyframes: {
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1", transform: "scale(1)" },
          "50%":      { opacity: "0.5", transform: "scale(1.4)" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 20px rgba(0,157,249,0.2), 0 0 40px rgba(254,142,1,0.1)" },
          "50%":      { boxShadow: "0 0 40px rgba(0,157,249,0.45), 0 0 80px rgba(254,142,1,0.2)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        ticker: {
          "0%":   { transform: "translateY(0)" },
          "100%": { transform: "translateY(-50%)" },
        },
        "fade-up": {
          from: { opacity: "0", transform: "translateY(24px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        "network-shimmer": {
          "0%":   { transform: "translateX(-100%) skewX(-15deg)" },
          "100%": { transform: "translateX(300%) skewX(-15deg)" },
        },
      },
      animation: {
        shimmer:          "shimmer 1.5s infinite linear",
        "pulse-dot":      "pulse-dot 2s ease-in-out infinite",
        "glow-pulse":     "glow-pulse 3s ease-in-out infinite",
        float:            "float 4s ease-in-out infinite",
        ticker:           "ticker 20s linear infinite",
        "fade-up":        "fade-up 0.5s ease-out",
        "network-shimmer":"network-shimmer 1.8s ease-in-out infinite",
      },
      boxShadow: {
        glow:      "var(--shadow-glow)",
        "glow-sm": "var(--shadow-glow-sm)",
        "glow-lg": "0 0 60px rgba(0,157,249,0.35), 0 0 120px rgba(254,142,1,0.15)",
        "card-border": "inset 0 1px 0 rgba(240,242,255,0.05)",
      },
      backdropBlur: {
        glass: "20px",
      },
    },
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".text-gradient": {
          background:              "linear-gradient(90deg, #009DF9 0%, #FE8E01 100%)",
          WebkitBackgroundClip:    "text",
          WebkitTextFillColor:     "transparent",
          backgroundClip:          "text",
        },
        ".bg-noise": {
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
        },
        ".glass": {
          backdropFilter:       "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          backgroundColor:      "var(--glass-bg)",
          border:               "1px solid var(--glass-border)",
        },
        ".glass-heavy": {
          backdropFilter:       "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          backgroundColor:      "var(--glass-bg)",
          border:               "1px solid var(--glass-border)",
        },
        ".ring-glow": {
          boxShadow: "0 0 0 2px var(--accent-primary), var(--shadow-glow-sm)",
        },
      });
    }),
  ],
};

export default config;
