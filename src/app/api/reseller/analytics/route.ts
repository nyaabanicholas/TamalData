import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Network } from "@/types";

// Helper to format date for grouping
function formatDate(date: Date, granularity: "day" | "week" | "month") {
  if (granularity === "day") {
    return date.toISOString().split("T")[0];
  } else if (granularity === "week") {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const weekStart = new Date(d.setDate(diff));
    return `Week of ${weekStart.toLocaleDateString("en-GH", { month: "short", day: "numeric" })}`;
  } else {
    return date.toLocaleString("en-GH", { year: "numeric", month: "short" });
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true, resellerStatus: true },
  });

  const isReseller = user?.role === "RESELLER" && user.resellerStatus === "APPROVED";
  if (!isReseller) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  try {
    // Get all orders for this reseller
    const orders = await prisma.order.findMany({
      where: { agentId: session.user.id, status: "DELIVERED" },
      select: {
        id: true,
        reference: true,
        network: true,
        bundleSize: true,
        sellPrice: true,
        costPrice: true,
        createdAt: true,
        bundleId: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Calculate summary statistics
    const totalRevenue = orders.reduce((sum, o) => sum + Number(o.sellPrice), 0);
    const totalOrders = orders.length;
    const totalCost = orders.reduce((sum, o) => sum + Number(o.costPrice), 0);
    const totalProfit = totalRevenue - totalCost;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Group by day
    const dailyMap = new Map<string, { revenue: number; orders: number; date: string }>();
    for (const order of orders) {
      const dateStr = formatDate(order.createdAt, "day");
      const existing = dailyMap.get(dateStr) || { revenue: 0, orders: 0, date: dateStr };
      existing.revenue += Number(order.sellPrice);
      existing.orders += 1;
      dailyMap.set(dateStr, existing);
    }

    const dailyData = Array.from(dailyMap.values())
      .sort((a, b) => a.date.localeCompare(b.date))
      .map((d) => ({ ...d, date: d.date }));



    // Group by network
    const networkMap = new Map<Network, { orders: number; revenue: number }>();
    for (const order of orders) {
      const network = order.network;
      const existing = networkMap.get(network) || { orders: 0, revenue: 0 };
      existing.orders += 1;
      existing.revenue += Number(order.sellPrice);
      networkMap.set(network, existing);
    }

    const networkData = Array.from(networkMap.entries()).map(([name, data]) => ({
      name,
      orders: data.orders,
      revenue: data.revenue,
    }));

    // Group by bundle
    const bundleMap = new Map<string, { orders: number }>();
    for (const order of orders) {
      const bundle = order.bundleSize;
      const existing = bundleMap.get(bundle) || { orders: 0 };
      existing.orders += 1;
      bundleMap.set(bundle, existing);
    }

    // Sort by orders and take top 10
    const bundleData = Array.from(bundleMap.entries())
      .map(([name, data]) => ({ name, orders: data.orders }))
      .sort((a, b) => b.orders - a.orders)
      .slice(0, 10);

    return NextResponse.json({
      summary: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalOrders,
        totalProfit: Number(totalProfit.toFixed(2)),
        avgOrderValue: Number(avgOrderValue.toFixed(2)),
      },
      dailyData,
      networkData,
      bundleData,
    });
  } catch (error) {
    console.error("[analytics] Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to load analytics" },
      { status: 500 }
    );
  }
}
