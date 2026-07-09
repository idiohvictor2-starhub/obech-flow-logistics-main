import React, { useEffect, useState } from "react";
import { ClipboardList, PackageCheck, Truck, Users, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts";
import { format, subDays } from "date-fns";

const COLORS = ['#0f172a', '#3b82f6', '#f59e0b', '#22c55e', '#ef4444'];

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalToday: 0,
    inTransit: 0,
    deliveredMonth: 0,
    failedMonth: 0,
  });
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [trendData, setTrendData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    
    // Fetch all shipments for stats
    const { data: shipments, error } = await supabase
      .from("shipments")
      .select("id, status, created_at, updated_at");

    if (!error && shipments) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      let totalToday = 0;
      let inTransit = 0;
      let deliveredMonth = 0;
      let failedMonth = 0;

      const statusCounts = {};
      const last30Days = {};
      
      for (let i = 29; i >= 0; i--) {
        last30Days[format(subDays(new Date(), i), 'MMM dd')] = 0;
      }

      shipments.forEach(s => {
        const createdDate = new Date(s.created_at);
        const updatedDate = new Date(s.updated_at);
        
        // Stats
        if (createdDate >= today) totalToday++;
        if (s.status === 'in_transit' || s.status === 'out_for_delivery') inTransit++;
        if (s.status === 'delivered' && updatedDate >= firstDayOfMonth) deliveredMonth++;
        if (s.status === 'failed' && updatedDate >= firstDayOfMonth) failedMonth++;

        // Status Distribution
        statusCounts[s.status] = (statusCounts[s.status] || 0) + 1;

        // Trend
        const formattedDate = format(createdDate, 'MMM dd');
        if (last30Days[formattedDate] !== undefined) {
          last30Days[formattedDate]++;
        }
      });

      setStats({ totalToday, inTransit, deliveredMonth, failedMonth });
      
      setStatusDistribution(
        Object.keys(statusCounts).map(key => ({
          name: key.replace("_", " ").toUpperCase(),
          value: statusCounts[key]
        }))
      );

      setTrendData(
        Object.keys(last30Days).map(key => ({
          name: key,
          shipments: last30Days[key]
        }))
      );
    }
    
    setLoading(false);
  };

  const statCards = [
    { label: "Shipments Today", value: stats.totalToday, icon: ClipboardList, color: "text-blue-500" },
    { label: "In Transit Now", value: stats.inTransit, icon: Truck, color: "text-amber-500" },
    { label: "Delivered (Month)", value: stats.deliveredMonth, icon: PackageCheck, color: "text-green-500" },
    { label: "Failed (Month)", value: stats.failedMonth, icon: AlertCircle, color: "text-red-500" },
  ];

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-steel border-t-orange rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-heading font-black text-navy">
        Analytics Dashboard
      </h1>
      <p className="text-muted-foreground mt-1">
        Overview of real-time shipment activity and operations.
      </p>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">
        {statCards.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="bg-white rounded-2xl border border-steel p-6 shadow-sm"
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-slate-50 border border-slate-100 ${item.color}`}>
                <Icon size={24} />
              </div>
              <p className="text-3xl font-heading font-black text-navy mt-4">
                {item.value}
              </p>
              <p className="text-sm font-bold text-muted-foreground mt-1 uppercase tracking-wider">
                {item.label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Line Chart */}
        <div className="bg-white rounded-2xl border border-steel p-6 shadow-sm lg:col-span-2">
          <h3 className="font-heading font-bold text-navy mb-6">Shipments Over Last 30 Days</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Line type="monotone" dataKey="shipments" stroke="#f97316" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart */}
        <div className="bg-white rounded-2xl border border-steel p-6 shadow-sm">
          <h3 className="font-heading font-bold text-navy mb-6">Status Distribution</h3>
          <div className="h-[300px] w-full relative">
            {statusDistribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusDistribution}
                    innerRadius={80}
                    outerRadius={110}
                    paddingAngle={2}
                    dataKey="value"
                  >
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
            
            {/* Center Label */}
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