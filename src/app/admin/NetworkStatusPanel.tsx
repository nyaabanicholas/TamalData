"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type NetStatus = "OPERATIONAL" | "DEGRADED" | "DOWN";

interface Props {
  mtnStatus: string;
  telecelStatus: string;
  airteltigoStatus: string;
}

const OPTIONS: { value: NetStatus; label: string; color: string; bg: string }[] = [
  { value: "OPERATIONAL", label: "Fast",    color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  { value: "DEGRADED",    label: "Delayed", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  { value: "DOWN",        label: "Down",    color: "#ef4444", bg: "rgba(239,68,68,0.12)"  },
];

const NETWORKS: { key: keyof Props; label: string }[] = [
  { key: "mtnStatus",        label: "MTN"        },
  { key: "telecelStatus",    label: "Telecel"    },
  { key: "airteltigoStatus", label: "AirtelTigo" },
];

export function NetworkStatusPanel(props: Props) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, NetStatus>>({
    mtnStatus:        props.mtnStatus as NetStatus,
    telecelStatus:    props.telecelStatus as NetStatus,
    airteltigoStatus: props.airteltigoStatus as NetStatus,
  });
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);

  async function save(next: Record<string, NetStatus>) {
    setSaving(true);
    setSaved(false);
    try {
      await fetch("/api/admin/network-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      setSaved(true);
      router.refresh();
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  }

  function toggle(key: string, value: NetStatus) {
    const next = { ...values, [key]: value };
    setValues(next);
    save(next);
  }

  return (
    <div className="liquid-glass rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display font-semibold text-text-primary text-sm uppercase tracking-wider">
          Network Delivery Speed
        </h2>
        {saved && <span className="text-xs text-color-success font-semibold">Saved</span>}
        {saving && <span className="text-xs text-text-muted">Saving…</span>}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {NETWORKS.map(({ key, label }) => {
          const current = values[key];
          return (
            <div key={key}>
              <p className="text-xs text-text-muted font-medium mb-2">{label}</p>
              <div className="flex gap-1.5">
                {OPTIONS.map((opt) => {
                  const active = current === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => toggle(key, opt.value)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all border"
                      style={
                        active
                          ? { backgroundColor: opt.bg, color: opt.color, borderColor: `${opt.color}44` }
                          : { backgroundColor: "transparent", color: "var(--color-text-muted)", borderColor: "var(--color-border)" }
                      }
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[10px] text-text-muted mt-3">
        Status shown on the Buy page banner and order tracking page in real time.
      </p>
    </div>
  );
}
