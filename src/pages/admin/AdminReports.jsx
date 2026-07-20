import React, { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  Calendar,
  Download,
  Plane,
  Ship,
  PackageCheck,
  FileSpreadsheet,
  Globe,
  Filter,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { format, startOfDay, subDays, startOfWeek, startOfMonth, startOfYear, isAfter } from "date-fns";
import { getQuoteRequests } from "@/utils/cmsStorage";
import { useToast } from "@/components/ui/use-toast";

export default function AdminReports() {
  const { toast } = useToast();
  const [timeframe, setTimeframe] = useState("monthly"); // "daily" | "weekly" | "monthly" | "yearly"
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    totalCount: 0,
    deliveredCount: 0,
    inTransitCount: 0,
    pendingCount: 0,
    failedCount: 0,
    totalWeightKg: 0,
    airCount: 0,
    seaCount: 0,
    courierCount: 0,
    routesBreakdown: [],
    records: [],
  });

  const generateReport = useCallback(async () => {
    setLoading(true);

    try {
      // 1. Fetch Supabase shipments
      const { data: dbShipments } = await supabase
        .from("shipments")
        .select("id, tracking_id, client_name, client_email, client_phone, service_type, sender_address, receiver_address, status, weight, created_at");

      // 2. Fetch local storage quote requests
      const localQuotes = getQuoteRequests();

      // Deduplicate combined records by tracking_id
      const map = new Map();
      (dbShipments || []).forEach((item) => map.set(item.tracking_id || item.id, item));
      (localQuotes || []).forEach((item) => {
        const id = item.tracking_id || item.id;
        if (!map.has(id)) {
          map.set(id, {
            id: item.id,
            tracking_id: item.tracking_id,
            client_name: item.fullName || item.client_name,
            client_email: item.email || item.client_email,
            client_phone: item.phone || item.client_phone,
            service_type: item.freightType || item.service_type || "Air Freight",
            sender_address: item.originCountry || item.sender_address,
            receiver_address: item.destinationCountry || item.receiver_address,
            status: item.status || "pending",
            weight: parseFloat(item.estimatedWeight || item.weight) || 0,
            created_at: item.created_at || new Date().toISOString(),
          });
        }
      });

      const allRecords = Array.from(map.values());

      // Filter by selected timeframe
      const now = new Date();
      let cutoffDate = startOfDay(now);

      if (timeframe === "daily") {
        cutoffDate = startOfDay(now);
      } else if (timeframe === "weekly") {
        cutoffDate = startOfWeek(now, { weekStartsOn: 1 });
      } else if (timeframe === "monthly") {
        cutoffDate = startOfMonth(now);
      } else if (timeframe === "yearly") {
        cutoffDate = startOfYear(now);
      }

      const filtered = allRecords.filter((rec) => {
        const recDate = rec.created_at ? new Date(rec.created_at) : new Date();
        return recDate >= cutoffDate;
      });

      let deliveredCount = 0;
      let inTransitCount = 0;
      let pendingCount = 0;
      let failedCount = 0;
      let totalWeightKg = 0;
      let airCount = 0;
      let seaCount = 0;
      let courierCount = 0;

      const routeCounts = {};

      filtered.forEach((rec) => {
        // Status counts
        const st = (rec.status || "pending").toLowerCase();
        if (st === "delivered") deliveredCount++;
        else if (st === "in_transit" || st === "out_for_delivery" || st === "picked_up") inTransitCount++;
        else if (st === "failed") failedCount++;
        else pendingCount++;

        // Weight
        const wt = parseFloat(rec.weight || rec.weight_kg) || 0;
        totalWeightKg += wt;

        // Service Type
        const srv = (rec.service_type || "").toLowerCase();
        if (srv.includes("air")) airCount++;
        else if (srv.includes("sea") || srv.includes("ocean")) seaCount++;
        else courierCount++;

        // Routes
        const routeKey = `${rec.sender_address || "Origin"} → ${rec.receiver_address || "Destination"}`;
        routeCounts[routeKey] = (routeCounts[routeKey] || 0) + 1;
      });

      const routesBreakdown = Object.keys(routeCounts)
        .map((rk) => ({ route: rk, count: routeCounts[rk] }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setReportData({
        totalCount: filtered.length,
        deliveredCount,
        inTransitCount,
        pendingCount,
        failedCount,
        totalWeightKg: Math.round(totalWeightKg),
        airCount,
        seaCount,
        courierCount,
        routesBreakdown,
        records: filtered,
      });
    } catch (err) {
      console.error("Report generation error:", err);
    } finally {
      setLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    generateReport();
  }, [generateReport]);

  const exportCSV = () => {
    if (!reportData.records || reportData.records.length === 0) {
      toast({
        title: "No Data to Export",
        description: `No shipments found for the ${timeframe} timeframe.`,
        variant: "destructive",
      });
      return;
    }

    const headers = [
      "Tracking ID",
      "Client Name",
      "Client Email",
      "Client Phone",
      "Service Type",
      "Origin",
      "Destination",
      "Status",
      "Weight (kg)",
      "Created Date",
    ];

    const rows = reportData.records.map((r) => [
      r.tracking_id || r.id,
      `"${(r.client_name || "").replace(/"/g, '""')}"`,
      `"${(r.client_email || "").replace(/"/g, '""')}"`,
      `"${(r.client_phone || "").replace(/"/g, '""')}"`,
      `"${(r.service_type || "").replace(/"/g, '""')}"`,
      `"${(r.sender_address || "").replace(/"/g, '""')}"`,
      `"${(r.receiver_address || "").replace(/"/g, '""')}"`,
      r.status || "pending",
      r.weight || 0,
      r.created_at ? format(new Date(r.created_at), "yyyy-MM-dd HH:mm") : "",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Obech_Logistics_Report_${timeframe.toUpperCase()}_${format(new Date(), "yyyyMMdd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Report Exported",
      description: `Downloaded ${reportData.records.length} records as CSV.`,
    });
  };

  const timeframeLabels = {
    daily: "Daily (Today)",
    weekly: "Weekly (This Week)",
    monthly: "Monthly (This Month)",
    yearly: "Yearly (This Year)",
  };

  return (
    <div className="space-y-8">
      {/* Header & Timeframe Selector Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-navy">
            Performance & Operational Reports
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Generate and analyze logistics metrics for Daily, Weekly, Monthly, and Yearly timeframes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Timeframe selector tabs */}
          <div className="flex bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
            {["daily", "weekly", "monthly", "yearly"].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3.5 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                  timeframe === tf
                    ? "bg-orange text-white shadow-sm"
                    : "text-gray-600 hover:text-navy"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light transition-all shadow-sm"
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* Summary Cards Grid for Selected Timeframe */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-steel shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">
              Total Shipments ({timeframeLabels[timeframe]})
            </span>
            <TrendingUp size={20} className="text-orange" />
          </div>
          <div className="text-3xl font-heading font-black text-navy">{reportData.totalCount}</div>
          <span className="text-xs text-gray-500 mt-1 block">
            Across all international routes
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-steel shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">
              Delivered Cargo
            </span>
            <CheckCircle2 size={20} className="text-emerald-500" />
          </div>
          <div className="text-3xl font-heading font-black text-emerald-600">{reportData.deliveredCount}</div>
          <span className="text-xs text-emerald-600 font-semibold mt-1 block">
            {reportData.totalCount > 0
              ? `${Math.round((reportData.deliveredCount / reportData.totalCount) * 100)}% Success Rate`
              : "0% Rate"}
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-steel shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">
              In Transit / Active
            </span>
            <Clock size={20} className="text-amber-500" />
          </div>
          <div className="text-3xl font-heading font-black text-amber-600">{reportData.inTransitCount}</div>
          <span className="text-xs text-gray-500 mt-1 block">Active global movement</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-steel shadow-sm">
          <div className="flex items-center justify-between text-muted-foreground mb-3">
            <span className="text-xs uppercase tracking-wider font-semibold text-gray-500">
              Total Weight Handled
            </span>
            <Globe size={20} className="text-blue-500" />
          </div>
          <div className="text-3xl font-heading font-black text-navy">{reportData.totalWeightKg.toLocaleString()} kg</div>
          <span className="text-xs text-gray-500 mt-1 block">Gross cargo weight</span>
        </div>
      </div>

      {/* Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Service Type Breakdown */}
        <div className="bg-white rounded-2xl border border-steel p-6 shadow-sm">
          <h3 className="text-lg font-heading font-bold text-navy mb-6">
            Service Channel Volume ({timeframeLabels[timeframe]})
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-sm text-navy mb-2 font-semibold">
                <span className="flex items-center gap-2">
                  <Plane size={16} className="text-orange" /> Air Freight (Flagship)
                </span>
                <span className="font-mono">{reportData.airCount} orders ({reportData.totalCount > 0 ? Math.round((reportData.airCount / reportData.totalCount) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-steel h-3 rounded-full overflow-hidden">
                <div
                  className="bg-orange h-full rounded-full transition-all duration-500"
                  style={{ width: `${reportData.totalCount > 0 ? (reportData.airCount / reportData.totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm text-navy mb-2 font-semibold">
                <span className="flex items-center gap-2">
                  <Ship size={16} className="text-blue-600" /> Sea Freight
                </span>
                <span className="font-mono">{reportData.seaCount} orders ({reportData.totalCount > 0 ? Math.round((reportData.seaCount / reportData.totalCount) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-steel h-3 rounded-full overflow-hidden">
                <div
                  className="bg-navy h-full rounded-full transition-all duration-500"
                  style={{ width: `${reportData.totalCount > 0 ? (reportData.seaCount / reportData.totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm text-navy mb-2 font-semibold">
                <span className="flex items-center gap-2">
                  <PackageCheck size={16} className="text-amber-500" /> Express Courier Partners (DHL/UPS/FedEx)
                </span>
                <span className="font-mono">{reportData.courierCount} orders ({reportData.totalCount > 0 ? Math.round((reportData.courierCount / reportData.totalCount) * 100) : 0}%)</span>
              </div>
              <div className="w-full bg-steel h-3 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${reportData.totalCount > 0 ? (reportData.courierCount / reportData.totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Top Active Shipping Routes */}
        <div className="bg-white rounded-2xl border border-steel p-6 shadow-sm">
          <h3 className="text-lg font-heading font-bold text-navy mb-6">
            Top International Shipping Lanes ({timeframeLabels[timeframe]})
          </h3>
          {reportData.routesBreakdown.length > 0 ? (
            <div className="divide-y divide-steel">
              {reportData.routesBreakdown.map((r, idx) => (
                <div key={idx} className="py-3 flex justify-between items-center text-sm">
                  <span className="font-semibold text-navy flex items-center gap-2">
                    <Globe size={15} className="text-orange" /> {r.route}
                  </span>
                  <span className="font-mono text-xs font-bold bg-steel/50 px-2.5 py-1 rounded text-navy">
                    {r.count} shipments
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-sm text-gray-400">
              No shipment lane records found for this timeframe.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
