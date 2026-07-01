import React, { useState } from "react";
import { Truck, Search, Star, ShieldCheck, ShieldAlert, Navigation } from "lucide-react";

const INITIAL_DRIVERS = [
  { id: "DRV-001", name: "Kwame Asare", type: "Bike Rider", license: "LIC-GHA-776", vehicle: "Honda Ace 125 (Bike-02)", rating: 4.8, status: "On Delivery" },
  { id: "DRV-002", name: "Chinedu Obi", type: "Van Driver", license: "LIC-NIG-443", vehicle: "Toyota HiAce (Van-01)", rating: 4.9, status: "Active" },
  { id: "DRV-003", name: "Mustapha Diallo", type: "Truck Operator", license: "LIC-SEN-882", vehicle: "Volvo FH16 (Truck-05)", rating: 4.7, status: "Active" },
  { id: "DRV-004", name: "Yaw Owusu", type: "Bike Rider", license: "LIC-GHA-110", vehicle: "Yamaha Crux (Bike-07)", rating: 4.5, status: "Off Duty" },
  { id: "DRV-005", name: "Babajide Williams", type: "Van Driver", license: "LIC-NIG-909", vehicle: "Ford Transit (Van-03)", rating: 4.6, status: "On Delivery" }
];

export default function AdminDrivers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [drivers] = useState(INITIAL_DRIVERS);

  const filtered = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.vehicle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-black text-navy">Drivers & Riders</h1>
        <p className="text-muted-foreground mt-1">
          Monitor status, licensing and vehicle assignments for field dispatch staff.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-steel flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center text-orange shrink-0">
            <Truck size={22} />
          </div>
          <div>
            <div className="text-2xl font-heading font-black text-navy">{drivers.length}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total Crew</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-steel flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 shrink-0">
            <ShieldCheck size={22} />
          </div>
          <div>
            <div className="text-2xl font-heading font-black text-navy">
              {drivers.filter((d) => d.status === "On Delivery" || d.status === "Active").length}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">On Duty</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-steel flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
            <Navigation size={22} />
          </div>
          <div>
            <div className="text-2xl font-heading font-black text-navy">
              {drivers.filter((d) => d.status === "On Delivery").length}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">On Road Now</div>
          </div>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-2xl border border-steel overflow-hidden shadow-sm">
        <div className="p-5 border-b border-steel flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search size={18} className="absolute left-3.5 top-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search drivers by name, vehicle or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-steel rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-steel/30 text-navy font-semibold text-xs uppercase tracking-wider border-b border-steel">
                <th className="px-6 py-4">Crew Details</th>
                <th className="px-6 py-4">Vehicle Assigned</th>
                <th className="px-6 py-4">License Code</th>
                <th className="px-6 py-4 text-center">Rating</th>
                <th className="px-6 py-4">Duty Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel">
              {filtered.length > 0 ? (
                filtered.map((drv) => (
                  <tr key={drv.id} className="hover:bg-steel/10 transition-colors text-sm text-navy">
                    <td className="px-6 py-4">
                      <div className="font-bold">{drv.name}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">{drv.type} ({drv.id})</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-muted-foreground">{drv.vehicle}</td>
                    <td className="px-6 py-4 font-mono text-xs">{drv.license}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-1">
                        <Star size={14} className="fill-orange text-orange" />
                        <span className="font-semibold text-xs">{drv.rating}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          drv.status === "On Delivery"
                            ? "bg-blue-100 text-blue-800"
                            : drv.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {drv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-orange hover:text-orange-light font-bold text-xs uppercase tracking-wider">
                        Track Map
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-muted-foreground">
                    No drivers found matching "{searchTerm}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
