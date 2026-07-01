import React, { useState } from "react";
import { Truck, Search, Settings, AlertTriangle, CheckCircle, HelpCircle } from "lucide-react";

const INITIAL_VEHICLES = [
  { id: "VEH-001", model: "Toyota HiAce (Van)", plate: "GHA-8821-22", driver: "Chinedu Obi", status: "Active", fuel: "75%", maintenance: "2026-08-15" },
  { id: "VEH-002", model: "Honda Ace 125 (Bike)", plate: "GHA-1092-23", driver: "Kwame Asare", status: "In Transit", fuel: "40%", maintenance: "2026-07-20" },
  { id: "VEH-003", model: "Volvo FH16 (Heavy Truck)", plate: "SEN-4451-A", driver: "Mustapha Diallo", status: "Active", fuel: "90%", maintenance: "2026-09-01" },
  { id: "VEH-004", model: "Ford Transit (Van)", plate: "NIG-9921-LA", driver: "Babajide Williams", status: "In Transit", fuel: "30%", maintenance: "2026-07-25" },
  { id: "VEH-005", model: "Yamaha Crux (Bike)", plate: "GHA-7711-20", driver: "Yaw Owusu", status: "Maintenance", fuel: "10%", maintenance: "2026-07-02" }
];

export default function AdminVehicles() {
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicles] = useState(INITIAL_VEHICLES);

  const filtered = vehicles.filter(
    (v) =>
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.driver.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-black text-navy">Fleet Inventory</h1>
        <p className="text-muted-foreground mt-1">
          Manage logistics fleet status, plate registrations, and maintenance schedules.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-steel flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange/10 flex items-center justify-center text-orange shrink-0">
            <Truck size={22} />
          </div>
          <div>
            <div className="text-2xl font-heading font-black text-navy">{vehicles.length}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Fleet</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-steel flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center text-green-600 shrink-0">
            <CheckCircle size={22} />
          </div>
          <div>
            <div className="text-2xl font-heading font-black text-navy">
              {vehicles.filter((v) => v.status === "Active" || v.status === "In Transit").length}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Operational</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-steel flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div>
            <div className="text-2xl font-heading font-black text-navy">
              {vehicles.filter((v) => v.status === "Maintenance").length}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">In Workshop</div>
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
              placeholder="Search fleet by model, plate or driver..."
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
                <th className="px-6 py-4">Vehicle Model</th>
                <th className="px-6 py-4">Plate Code</th>
                <th className="px-6 py-4">Assigned Driver</th>
                <th className="px-6 py-4">Fuel Status</th>
                <th className="px-6 py-4">Next Service</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel">
              {filtered.length > 0 ? (
                filtered.map((v) => (
                  <tr key={v.id} className="hover:bg-steel/10 transition-colors text-sm text-navy">
                    <td className="px-6 py-4">
                      <div className="font-bold">{v.model}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">{v.id}</div>
                    </td>
                    <td className="px-6 py-4 font-mono font-semibold">{v.plate}</td>
                    <td className="px-6 py-4 font-medium">{v.driver}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-12 bg-steel rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-orange h-full"
                            style={{ width: v.fuel }}
                          />
                        </div>
                        <span className="font-mono text-xs">{v.fuel}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs">{v.maintenance}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                          v.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : v.status === "In Transit"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {v.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-muted-foreground">
                    No vehicles found matching "{searchTerm}".
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
