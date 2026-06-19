import { prisma } from "@/lib/prisma";
import { ShieldAlert, ShieldCheck, Timer } from "lucide-react";

const STATUS_CONFIG: Record<string, { icon: typeof ShieldCheck; label: string; color: string; bg: string }> = {
  OPERATIONAL: {
    icon: ShieldCheck,
    label: "Fast delivery — typically under 30 minutes",
    color: "var(--color-success)",
    bg: "rgba(16,185,129,0.08)",
  },
  DEGRADED: {
    icon: Timer,
    label: "Delayed delivery — may take 1–3 hours",
    color: "var(--color-warning)",
    bg: "rgba(245,158,11,0.08)",
  },
  DOWN: {
    icon: ShieldAlert,
    label: "Service temporarily unavailable",
    color: "var(--color-error)",
    bg: "rgba(239,68,68,0.08)",
  },
};

export async function DeliveryStatusBanner() {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });

  if (!settings) return null;

  const networks = [
    { name: "MTN", status: settings.mtnStatus },
    { name: "Telecel", status: settings.telecelStatus },
    { name: "AirtelTigo", status: settings.airteltigoStatus },
  ];

  const nonOperational = networks.filter((n) => n.status !== "OPERATIONAL");

  return (
    <div className="flex flex-col items-center gap-4 mb-6">
      <div className="flex flex-wrap justify-center gap-3">
        {networks.map((net) => {
          const config = STATUS_CONFIG[net.status] ?? STATUS_CONFIG.OPERATIONAL;
          const Icon = config.icon;
          return (
            <div
              key={net.name}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-barlow font-medium"
              style={{ backgroundColor: config.bg, color: config.color, border: `1px solid ${config.color}22` }}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="font-semibold">{net.name}:</span>
              <span>{net.status === "OPERATIONAL" ? "Fast" : net.status === "DEGRADED" ? "Delayed" : "Down"}</span>
            </div>
          );
        })}
      </div>
      {nonOperational.length > 0 && (
        <p className="text-xs text-text-muted font-barlow text-center">
          ⚠️ Some networks are experiencing delays. Orders will still be processed and delivered.
        </p>
      )}
    </div>
  );
}
