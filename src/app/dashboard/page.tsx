import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { SystemStatusBar } from "@/components/dashboard/SystemStatusBar";
import { StatStrip } from "@/components/dashboard/StatStrip";
import { PlaceNewOrder } from "@/components/dashboard/PlaceNewOrder";
import { RecentOrders } from "@/components/dashboard/RecentOrders";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { DashboardQuickBuy } from "@/components/dashboard/DashboardQuickBuy";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Dashboard — TamalData" };

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in?from=/dashboard");

  const userId = session.user.id;

  // Admin users get redirected to the admin panel
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, phone: true, walletBalance: true, role: true },
  });

  if (user?.role === "ADMIN") redirect("/admin");

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [recentOrders, ordersToday, gbSoldResult, revenueResult] = await Promise.all([
    prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: {
        id: true, reference: true, network: true, bundleSize: true,
        sellPrice: true, status: true, createdAt: true, recipientPhone: true,
      },
    }),
    prisma.order.count({ where: { userId, createdAt: { gte: todayStart } } }),
    prisma.order.findMany({
      where: { userId, status: "DELIVERED", createdAt: { gte: todayStart } },
      select: { bundleSize: true },
    }),
    prisma.order.aggregate({
      where: { userId, status: "DELIVERED", createdAt: { gte: todayStart } },
      _sum: { sellPrice: true, costPrice: true },
    }),
  ]);

  const gbSold = gbSoldResult.reduce((acc, o) => {
    const n = parseFloat(o.bundleSize);
    return acc + (isNaN(n) ? 0 : n);
  }, 0);

  const revenueToday = Number(revenueResult._sum.sellPrice ?? 0);
  const profitToday = revenueToday - Number(revenueResult._sum.costPrice ?? 0);
  const walletBalance = Number(user?.walletBalance ?? 0);

  return (
    <main className="min-h-screen bg-bg-base">
      <div className="container-content pt-28 pb-8 space-y-5">

        {/* Welcome banner with quick actions */}
        <WelcomeBanner name={user?.name ?? (user?.phone ?? "there")} role={user?.role} />

        {/* System status bar */}
        <SystemStatusBar />

        {/* Stat strip — animated count-ups */}
        <StatStrip
          walletBalance={walletBalance}
          ordersToday={ordersToday}
          gbSold={gbSold}
          revenueToday={revenueToday}
          profitToday={profitToday}
        />

        {/* Main grid: buy order + quick actions side-by-side */}
        <div className="grid lg:grid-cols-[1fr_280px] gap-5">
          <PlaceNewOrder />
          <QuickActions />
        </div>

        {/* Quick Buy widget */}
        <div>
          <h2 className="font-heading text-base text-text-primary mb-3 px-0.5">Quick Buy</h2>
          <DashboardQuickBuy userId={userId} />
        </div>

        {/* Recent orders table */}
        <RecentOrders
          orders={recentOrders.map((o) => ({
            ...o,
            sellPrice: Number(o.sellPrice),
          }))}
        />

      </div>
    </main>
  );
}
