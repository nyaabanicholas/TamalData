import { DashRail } from "@/components/ui/DashRail";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg-base">
      <DashRail />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
