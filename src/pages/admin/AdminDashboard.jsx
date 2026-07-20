import React, { useEffect, useState, useCallback } from "react";
import {
  ClipboardList,
  PackageCheck,
  Truck,
  AlertCircle,
  RefreshCw,
  Clock,
  Calendar,
  Filter,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { format, subDays, startOfDay, isSameDay } from "date-fns";
import { getQuoteRequests } from "@/utils/cmsStorage";

const COLORS = ["#0f172a", "#3b82f6", "#f59e0b", "#22c55e", "#ef4444"];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [timeRange, setTimeRange] = useState("30days"); // "today" | "7days" | "30days"

  const [stats, setStats] = useState({
    totalToday: 0,
    inTransit: 0,
    deliveredMonth: 0,
    failedMonth: 0,
  });

  const [statusDistribution, setStatusDistribution] = useState([]);
  const [trendData, setTrendData] = useState([]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);

    try {
      // 1. Fetch Supabase shipments
      const { data: dbShipments } = await supabase
        .from("shipments")
        .select("id, tracking_id, status, created_at, updated_at, weight_kg");

      // 2. Fetch local quote requests
      const localQuotes = getQuoteRequests();

      // Combine database and local storage records with deduplication by tracking_id
      const combinedMap = new Map();
      (dbShipments || []).forEach((item) => combinedMap.set(item.tracking_id || item.id, item));
      (localQuotes || []).forEach((item) => {
        const id = item.tracking_id || item.id;
        if (!combinedMap.has(id)) {
          combinedMap.set(id, item);
        }
      });

      const allShipments = Array.from(combinedMap.values());

      const todayStart = startOfDay(new Date());
      const firstDayOfMonth = new Date(todayStart.getFullYear(), todayStart.getMonth(), 1);

      let totalToday = 0;
      let inTransit = 0;
      let deliveredMonth = 0;
      let failedMonth = 0;

      const statusCounts = {};
      const trendDaysCount = timeRange === "today" ? 1 : timeRange === "7days" ? 7 : 30;
      const trendDaysMap = {};

      for (let i = trendDaysCount - 1; i >= 0; i--) {
        trendDaysMap[format(subDays(new Date(), i), "MMM dd")] = 0;
      }

      allShipments.forEach((s) => {
        const createdDate = s.created_at ? new Date(s.created_at) : new Date();
        const updatedDate = s.updated_at ? new Date(s.updated_at) : createdDate;

        // Daily stats
        if (isSameDay(createdDate, todayStart)) {
          totalToday++;
        }

        if (s.status === "in_transit" || s.status === "out_for_delivery") {
          inTransit++;
        }
        if (s.status === "delivered" && updatedDate >= firstDayOfMonth) {
          deliveredMonth++;
        }
        if (s.status === "failed" && updatedDate >= firstDayOfMonth) {
          failedMonth++;
        }

        // Status Distribution
        const stKey = s.status || "pending";
        statusCounts[stKey] = (statusCounts[stKey] || 0) + 1;

        // Trend
        const formattedDate = format(createdDate, "MMM dd");
        if (trendDaysMap[formattedDate] !== undefined) {
          trendDaysMap[formattedDate]++;
        }
      });

      setStats({ totalToday, inTransit, deliveredMonth, failedMonth });

      setStatusDistribution(
        Object.keys(statusCounts).map((key) => ({
          name: key.replace("_", " ").toUpperCase(),
          value: statusCounts[key],
        }))
      );

      setTrendData(
        Object.keys(trendDaysMap).map((key) => ({
          name: key,
          shipments: trendDaysMap[key],
        }))
      );

      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    fetchDashboardData();

    // Auto-refresh daily schedule / polling every 3 minutes
    const timer = setInterval(() => {
      fetchDashboardData();
    }, 3 * 60 * 1000);

    return () => clearInterval(timer);
  }, [fetchDashboardData]);

  const statCards = [
    { label: "New Quotes / Orders Today", value: stats.totalToday, icon: ClipboardList, color: "text-blue-500" },
    { label: "In Transit Now", value: stats.inTransit, icon: Truck, color: "text-amber-500" },
    { label: "Delivered (This Month)", value: stats.deliveredMonth, icon: PackageCheck, color: "text-emerald-500" },
    { label: "Failed / Attention Required", value: stats.failedMonth, icon: AlertCircle, color: "text-red-500" },
  ];

  return (
    <div className="space-y-8">
      {/* Dashboard Top Title & Daily Refresh Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-navy flex items-center gap-2">
            Real-Time Analytics Dashboard
          </h1>
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
            <Clock size={13} /> Refreshed daily automatically. Last updated:{" "}
            <span className="font-mono text-gray-700 font-semibold">
              {format(lastRefreshed, "hh:mm:ss a - MMM dd, yyyy")}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Timeframe Filter Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm text-xs font-semibold">
            <Filter size={14} className="text-orange" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-transparent text-navy focus:outline-none cursor-pointer"
            >
              <option value="today">Daily View (Today)</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
            </select>
          </div>

          {/* Manual Refresh Button */}
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Now
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="bg-white rounded-2xl border border-steel p-6 shadow-sm">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-100 ${item.color}`}>
                <Icon size={24} />
              </div>
              <p className="text-3xl font-heading font-black text-navy mt-4">{item.value}</p>
              <p className="text-xs font-bold text-muted-foreground mt-1 uppercase tracking-wider">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart */}
        <div className="bg-white rounded-2xl border border-steel p-6 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-heading font-bold text-navy text-base">
              Order & Shipment Trends ({timeRange === "today" ? "Today" : timeRange === "7days" ? "7 Days" : "30 Days"})
            </h3>
            <span className="text-xs font-mono text-orange font-semibold">Live Feed</span>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid #e2e8f0",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Line type="monotone" dataKey="shipments" stroke="#f97316" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white rounded-2xl border border-steel p-6 shadow-sm">
          <h3 className="font-heading font-bold text-navy mb-6">Status Breakdown</h3>
          <div className="h-[300px] w-full relative">
            {statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusDistribution} innerRadius={75} outerRadius={105} paddingAngle={2} dataKey="value">
                    {statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No data available
              </div>
            )}

            {statusDistribution.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-heading font-black text-navy">
                  {statusDistribution.reduce((acc, curr) => acc + curr.value, 0)}
                </span>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Total</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}