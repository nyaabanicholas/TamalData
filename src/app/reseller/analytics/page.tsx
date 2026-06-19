"use client";

import { useEffect, useState } from "react";
import { GlassPanel } from "@/components/ui/GlassPanel";
import { formatGHS } from "@/lib/utils";
import Link from "next/link";

// Recharts components
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Define types for our data
interface OrderData {
  date: string;
  revenue: number;
  orders: number;
}

interface NetworkData {
  name: string;
  orders: number;
  revenue: number;
}

interface BundleData {
  name: string;
  orders: number;
}

const NETWORK_COLORS = {
  MTN: "#00a86b",
  TELECEL: "#f59e0b",
  AIRTELTIGO: "#ef4444",
};

const COLORS = ["#00a86b", "#f59e0b", "#ef4444", "#3b82f6", "#8b5cf6", "#ec4899"];

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for all analytics data
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    totalProfit: 0,
    avgOrderValue: 0,
  });
  
  const [dailyData, setDailyData] = useState<OrderData[]>([]);
  const [networkData, setNetworkData] = useState<NetworkData[]>([]);
  const [bundleData, setBundleData] = useState<BundleData[]>([]);
  const [timeRange, setTimeRange] = useState<"7d" | "30d" | "90d" | "all">("7d");

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch("/api/reseller/analytics");
        if (!response.ok) {
          throw new Error("Failed to fetch analytics");
        }
        
        const data = await response.json();
        
        setSummary({
          totalRevenue: data.summary.totalRevenue,
          totalOrders: data.summary.totalOrders,
          totalProfit: data.summary.totalProfit,
          avgOrderValue: data.summary.avgOrderValue,
        });
        
        setDailyData(data.dailyData);
        setNetworkData(data.networkData);
        setBundleData(data.bundleData);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics");
      } finally {
        setLoading(false);
      }
    }
    
    fetchAnalytics();
  }, []);

  // Filter data based on selected time range
  const getChartData = () => {
    switch (timeRange) {
      case "7d":
        return dailyData.slice(-7);
      case "30d":
        return dailyData.slice(-30);
      case "90d":
        return dailyData.slice(-90);
      default:
        return dailyData;
    }
  };

  const chartData = getChartData();

  if (loading) {
    return (
      <div className="container-content pt-4 pb-10">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary mx-auto mb-4" />
          <p className="text-text-muted">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-content pt-4 pb-10">
        <GlassPanel className="p-6 text-center max-w-md mx-auto">
          <p className="text-color-warning mb-4">⚠️ {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-btn border border-color-border text-text-secondary text-sm hover:bg-bg-elevated transition-colors"
          >
            Retry
          </button>
        </GlassPanel>
      </div>
    );
  }

  return (
    <div className="container-content pt-4 pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-extrabold text-3xl text-text-primary">Analytics</h1>
          <p className="text-text-secondary text-sm mt-1">
            Track your sales performance and business growth
          </p>
        </div>
        <Link href="/reseller">
          <button className="px-4 py-2 rounded-btn border border-color-border text-text-secondary text-xs hover:bg-bg-elevated transition-colors">
            ← Back to Dashboard
          </button>
        </Link>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Revenue", value: formatGHS(summary.totalRevenue), color: "var(--accent-primary)" },
          { label: "Total Orders", value: summary.totalOrders, color: "var(--accent-glow)" },
          { label: "Total Profit", value: formatGHS(summary.totalProfit), color: "var(--color-success)" },
          { label: "Avg. Order", value: formatGHS(summary.avgOrderValue), color: "var(--color-warning)" },
        ].map((s) => (
          <GlassPanel key={s.label} className="p-4">
            <p className="text-xs text-text-muted uppercase tracking-widest mb-1">{s.label}</p>
            <p className="font-display font-bold text-xl" style={{ color: s.color }}>{s.value}</p>
          </GlassPanel>
        ))}
      </div>

      {/* Time Range Selector */}
      <div className="flex gap-2 mb-6">
        {[
          { value: "7d" as const, label: "Last 7 Days" },
          { value: "30d" as const, label: "Last 30 Days" },
          { value: "90d" as const, label: "Last 90 Days" },
          { value: "all" as const, label: "All Time" },
        ].map((range) => (
          <button
            key={range.value}
            onClick={() => setTimeRange(range.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              timeRange === range.value
                ? "bg-accent-primary text-white border-accent-primary"
                : "border-color-border text-text-secondary"
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Revenue & Orders Chart */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <GlassPanel className="p-6">
          <h3 className="font-display font-semibold text-text-primary mb-4">Revenue Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="date"
                  stroke="var(--text-secondary)"
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  stroke="var(--text-secondary)"
                  tick={{ fontSize: 10 }}
                  tickFormatter={(value) => formatGHS(Number(value))}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-elevated)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                  }}
                  formatter={(value) => [formatGHS(Number(value)), "Revenue"]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="var(--accent-primary)"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "var(--accent-primary)" }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <h3 className="font-display font-semibold text-text-primary mb-4">Orders Over Time</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="date"
                  stroke="var(--text-secondary)"
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  stroke="var(--text-secondary)"
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-elevated)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="orders" name="Orders" fill="var(--accent-glow)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>

      {/* Network Distribution */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <GlassPanel className="p-6">
          <h3 className="font-display font-semibold text-text-primary mb-4">Revenue by Network</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={networkData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="revenue"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                >
                  {networkData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={NETWORK_COLORS[entry.name as keyof typeof NETWORK_COLORS] ?? COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-elevated)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                  }}
                  formatter={(value, name) => [formatGHS(Number(value)), name ?? ""]}
                />
                <Legend wrapperStyle={{ paddingTop: "20px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>

        <GlassPanel className="p-6">
          <h3 className="font-display font-semibold text-text-primary mb-4">Orders by Network</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={networkData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  type="number"
                  stroke="var(--text-secondary)"
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="var(--text-secondary)"
                  tick={{ fontSize: 10 }}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-elevated)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="orders" name="Orders" fill="var(--color-success)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>

      {/* Popular Bundles */}
      <div className="mb-8">
        <h3 className="font-display font-semibold text-lg text-text-primary mb-4">Most Popular Bundles</h3>
        <GlassPanel className="p-6">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bundleData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis
                  dataKey="name"
                  stroke="var(--text-secondary)"
                  tick={{ fontSize: 10, angle: -45, textAnchor: "end" }}
                  height={60}
                />
                <YAxis
                  stroke="var(--text-secondary)"
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--bg-elevated)",
                    border: "1px solid var(--color-border)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="orders" name="Orders" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassPanel>
      </div>

      {/* Summary Cards for Network Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {(Object.keys(NETWORK_COLORS) as Array<keyof typeof NETWORK_COLORS>).map((network) => {
          const data = networkData.find((n) => n.name === network);
          const orders = data?.orders ?? 0;
          const revenue = data?.revenue ?? 0;
          return (
            <GlassPanel key={network} className="p-4 text-center">
              <p className="text-xs text-text-muted uppercase tracking-wider mb-1">{network}</p>
              <p className="font-display font-bold text-xl" style={{ color: NETWORK_COLORS[network] }}>
                {orders}
              </p>
              <p className="text-xs text-text-muted mt-1">
                Orders: {orders} · Revenue: {formatGHS(revenue)}
              </p>
            </GlassPanel>
          );
        })}
      </div>
    </div>
  );
}
