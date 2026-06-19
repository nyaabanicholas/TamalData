import type { Metadata } from "next";
import { LiveDot } from "@/components/ui/LiveDot";
import { Footer } from "@/components/landing/Footer";
import type { NetworkStatus } from "@/types";

export const metadata: Metadata = { title: "Network Status" };
export const revalidate = 60;

async function getStatuses(): Promise<NetworkStatus[]> {
  try {
    const base = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const res = await fetch(`${base}/api/networks/status`, { cache: "no-store" });
    return res.json();
  } catch {
    return [];
  }
}

const STATUS_COLORS: Record<string, string> = {
  OPERATIONAL: "text-emerald-400",
  DEGRADED: "text-amber-400",
  OFFLINE: "text-red-400",
};

export default async function StatusPage() {
  const statuses = await getStatuses();

  return (
    <>
      <main className="cinematic min-h-screen pt-32 pb-20">
        <div className="container-content max-w-2xl mx-auto px-4">
          <h1 className="font-heading text-text-primary text-5xl md:text-6xl tracking-[-2px] leading-[0.9] mb-3 text-center">
            Network Status
          </h1>
          <p className="text-text-secondary text-center mb-10 font-barlow font-light">
            Live operational status of all supported networks.
          </p>

          <div className="space-y-4">
            {statuses.map((s) => (
              <div key={s.network} className="liquid-glass rounded-[1.25rem] p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <LiveDot active={s.status === "OPERATIONAL"} />
                  <div>
                    <p className="font-heading text-text-primary text-2xl">
                      {s.network === "AIRTELTIGO" ? "AirtelTigo" : s.network === "TELECEL" ? "Telecel" : "MTN"}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5 font-barlow font-light">
                      Updated {new Date(s.lastChecked).toLocaleTimeString("en-GH")}
                    </p>
                  </div>
                </div>
                <span className={`font-semibold text-sm font-barlow ${STATUS_COLORS[s.status] ?? "text-text-muted"}`}>
                  {s.status === "OPERATIONAL" ? "Operational" : s.status === "DEGRADED" ? "Degraded" : "Offline"}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
