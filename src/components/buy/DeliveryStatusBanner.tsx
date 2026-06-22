import { prisma } from "@/lib/prisma";
import { Zap, Clock, AlertTriangle } from "lucide-react";

const STATUS_CONFIG: Record<string, {
  icon: typeof Zap;
  headline: string;
  body: string;
  color: string;
  bg: string;
  border: string;
}> = {
  OPERATIONAL: {
    icon: Zap,
    headline: "Deliveries are blazing fast!",
    body: "Your order should arrive within minutes of payment confirmation.",
    color: "var(--color-success)",
    bg: "rgba(16,185,129,0.07)",
    border: "rgba(16,185,129,0.20)",
  },
  DEGRADED: {
    icon: Clock,
    headline: "Processing times are currently elevated.",
    body: "Our network partner is experiencing higher-than-usual load. Your order will still be delivered — expect delivery within 1–3 hours. We appreciate your patience.",
    color: "var(--color-warning)",
    bg: "rgba(245,158,11,0.07)",
    border: "rgba(245,158,11,0.22)",
  },
  DOWN: {
    icon: AlertTriangle,
    headline: "Service temporarily unavailable.",
    body: "We're aware of the issue and our team is working to restore service as quickly as possible. Existing orders will be processed once service resumes.",
    color: "var(--color-error)",
    bg: "rgba(239,68,68,0.07)",
    border: "rgba(239,68,68,0.22)",
  },
};

export async function DeliveryStatusBanner({ network }: { network?: string }) {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "singleton" } });
  if (!settings) return null;

  // Determine which network status to show (or overall worst status)
  let status = "OPERATIONAL";
  if (network) {
    const map: Record<string, string> = {
      MTN: settings.mtnStatus,
      TELECEL: settings.telecelStatus,
      AIRTELTIGO: settings.airteltigoStatus,
    };
    status = map[network] ?? "OPERATIONAL";
  } else {
    // Show worst overall status
    const statuses = [settings.mtnStatus, settings.telecelStatus, settings.airteltigoStatus];
    if (statuses.includes("DOWN")) status = "DOWN";
    else if (statuses.includes("DEGRADED")) status = "DEGRADED";
  }

  // Don't show banner if everything is operational (keep UI clean)
  if (status === "OPERATIONAL") return null;

  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.DEGRADED;
  const Icon = cfg.icon;

  return (
    <div
      className="flex items-start gap-3 rounded-2xl px-5 py-4 mb-6"
      style={{ backgroundColor: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <Icon className="h-5 w-5 shrink-0 mt-0.5" style={{ color: cfg.color }} />
      <div>
        <p className="text-sm font-semibold font-barlow" style={{ color: cfg.color }}>
          {cfg.headline}
        </p>
        <p className="text-xs font-barlow mt-0.5" style={{ color: cfg.color, opacity: 0.85 }}>
          {cfg.body}
        </p>
      </div>
    </div>
  );
}
