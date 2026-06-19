"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="px-4 py-3 rounded-btn text-sm font-semibold whitespace-nowrap transition-all"
      style={copied
        ? { backgroundColor: "var(--color-success)", color: "#fff" }
        : { backgroundColor: "var(--accent-primary)", color: "#fff" }}>
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
