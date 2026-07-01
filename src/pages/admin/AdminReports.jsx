import React from "react";
import { TrendingUp, DollarSign, Clock, CheckCircle2, ArrowUpRight } from "lucide-react";

export default function AdminReports() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-black text-navy">Performance & Reports</h1>
        <p className="text-muted-foreground mt-1">
          Review operational efficiency, revenues and shipment success metrics.
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-steel">
          <div className="flex items-center justify-between text-muted-foreground mb-4">
            <span className="text-xs uppercase tracking-wider font-semibold">Monthly Income</span>
            <DollarSign size={20} className="text-orange" />
          </div>
          <div className="text-2xl font-heading font-black text-navy">$18,420</div>
          <span className="text-xs text-green-600 font-bold flex items-center gap-0.5 mt-1.5">
            <ArrowUpRight size={14} /> +12% from last month
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-steel">
          <div className="flex items-center justify-between text-muted-foreground mb-4">
            <span className="text-xs uppercase tracking-wider font-semibold">Avg. Delivery Time</span>
            <Clock size={20} className="text-orange" />
          </div>
          <div className="text-2xl font-heading font-black text-navy">42 mins</div>
          <span className="text-xs text-green-600 font-bold flex items-center gap-0.5 mt-1.5">
            <ArrowUpRight size={14} /> -8% (Faster)
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-steel">
          <div className="flex items-center justify-between text-muted-foreground mb-4">
            <span className="text-xs uppercase tracking-wider font-semibold">Completion Rate</span>
            <CheckCircle2 size={20} className="text-orange" />
          </div>
          <div className="text-2xl font-heading font-black text-navy">99.4%</div>
          <span className="text-xs text-green-600 font-bold flex items-center gap-0.5 mt-1.5">
            <ArrowUpRight size={14} /> +0.2% improvement
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-steel">
          <div className="flex items-center justify-between text-muted-foreground mb-4">
            <span className="text-xs uppercase tracking-wider font-semibold">Total Orders Run</span>
            <TrendingUp size={20} className="text-orange" />
          </div>
          <div className="text-2xl font-heading font-black text-navy">1,248</div>
          <span className="text-xs text-green-600 font-bold flex items-center gap-0.5 mt-1.5">
            <ArrowUpRight size={14} /> +15.3% growth
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Channels */}
        <div className="bg-white rounded-2xl border border-steel p-6 shadow-sm">
          <h3 className="text-lg font-heading font-bold text-navy mb-4">Top Fleet Channels</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-navy mb-1.5 font-medium">
                <span>Bike Dispatch (Small parcels)</span>
                <span className="font-bold">642 Deliveries (51%)</span>
              </div>
              <div className="w-full bg-steel h-3 rounded-full overflow-hidden">
                <div className="bg-orange h-full rounded-full" style={{ width: "51%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-navy mb-1.5 font-medium">
                <span>Van Delivery (Medium goods)</span>
                <span className="font-bold">410 Deliveries (33%)</span>
              </div>
              <div className="w-full bg-steel h-3 rounded-full overflow-hidden">
                <div className="bg-navy h-full rounded-full" style={{ width: "33%" }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm text-navy mb-1.5 font-medium">
                <span>Truck Logistics (Bulk goods)</span>
                <span className="font-bold">196 Deliveries (16%)</span>
              </div>
              <div className="w-full bg-steel h-3 rounded-full overflow-hidden">
                <div className="bg-orange-light h-full rounded-full" style={{ width: "16%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Popular Delivery Routes */}
        <div className="bg-white rounded-2xl border border-steel p-6 shadow-sm">
          <h3 className="text-lg font-heading font-bold text-navy mb-4">Top Shipping Routes</h3>
          <div className="divide-y divide-steel">
            <div className="py-3 flex justify-between items-center text-sm">
              <span className="font-medium text-navy">Accra ↔ Kumasi</span>
              <span className="text-muted-foreground">340 orders</span>
            </div>
            <div className="py-3 flex justify-between items-center text-sm">
              <span className="font-medium text-navy">Lagos ↔ Abuja</span>
              <span className="text-muted-foreground">285 orders</span>
            </div>
            <div className="py-3 flex justify-between items-center text-sm">
              <span className="font-medium text-navy">Dakar ↔ Thiès</span>
              <span className="text-muted-foreground">198 orders</span>
            </div>
            <div className="py-3 flex justify-between items-center text-sm">
              <span className="font-medium text-navy">Accra ↔ Takoradi</span>
              <span className="text-muted-foreground">152 orders</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
