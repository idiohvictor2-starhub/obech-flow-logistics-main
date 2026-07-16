import React, { useState, useEffect } from "react";
import { Truck, Search, Settings, AlertTriangle, CheckCircle, HelpCircle, Plus, Trash2, X } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const INITIAL_VEHICLES = [
  { id: "VEH-001", model: "Toyota HiAce (Van)", plate: "GHA-8821-22", driver: "Chinedu Obi", status: "Active", fuel: "75%", maintenance: "2026-08-15" },
  { id: "VEH-002", model: "Honda Ace 125 (Bike)", plate: "GHA-1092-23", driver: "Kwame Asare", status: "In Transit", fuel: "40%", maintenance: "2026-07-20" },
  { id: "VEH-003", model: "Volvo FH16 (Heavy Truck)", plate: "SEN-4451-A", driver: "Mustapha Diallo", status: "Active", fuel: "90%", maintenance: "2026-09-01" },
  { id: "VEH-004", model: "Ford Transit (Van)", plate: "NIG-9921-LA", driver: "Babajide Williams", status: "In Transit", fuel: "30%", maintenance: "2026-07-25" },
  { id: "VEH-005", model: "Yamaha Crux (Bike)", plate: "GHA-7711-20", driver: "Yaw Owusu", status: "Maintenance", fuel: "10%", maintenance: "2026-07-02" }
];

export default function AdminVehicles() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [vehicles, setVehicles] = useState(() => {
    const stored = localStorage.getItem("obech_vehicles");
    return stored ? JSON.parse(stored) : INITIAL_VEHICLES;
  });

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    model: "",
    plate: "",
    driver: "",
    status: "Active",
    fuel: "100%",
    maintenance: new Date().toISOString().split("T")[0]
  });

  const handleClearFleet = () => {
    if (!window.confirm("Are you sure you want to permanently clear all vehicles in the fleet? This action is irreversible.")) {
      return;
    }
    setVehicles([]);
    localStorage.setItem("obech_vehicles", JSON.stringify([]));
    toast({
      title: "Fleet Inventory Cleared",
      description: "All vehicles have been removed from the database.",
    });
  };

  const handleAddVehicle = (e) => {
    e.preventDefault();
    if (!newVehicle.model || !newVehicle.plate || !newVehicle.driver) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const randNum = Math.floor(100 + Math.random() * 900);
    const vehicleId = `VEH-${randNum}`;

    const formattedFuel = newVehicle.fuel.endsWith("%") ? newVehicle.fuel : `${newVehicle.fuel}%`;
    const item = {
      id: vehicleId,
      model: newVehicle.model,
      plate: newVehicle.plate,
      driver: newVehicle.driver,
      status: newVehicle.status,
      fuel: formattedFuel,
      maintenance: newVehicle.maintenance
    };

    const updated = [item, ...vehicles];
    setVehicles(updated);
    localStorage.setItem("obech_vehicles", JSON.stringify(updated));
    setIsAddOpen(false);
    setNewVehicle({
      model: "",
      plate: "",
      driver: "",
      status: "Active",
      fuel: "100%",
      maintenance: new Date().toISOString().split("T")[0]
    });
    toast({
      title: "Vehicle Added",
      description: `${item.model} has been added to the fleet.`,
    });
  };

  const filtered = vehicles.filter(
    (v) =>
      v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.driver.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-black text-navy">Fleet Inventory</h1>
          <p className="text-muted-foreground mt-1">
            Manage logistics fleet status, plate registrations, and maintenance schedules.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange text-white rounded-lg text-sm font-bold hover:bg-orange-light transition shadow-sm"
          >
            <Plus size={16} /> Add Vehicle
          </button>
          <button
            type="button"
            onClick={handleClearFleet}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition shadow-sm"
          >
            <Trash2 size={16} /> Clear Fleet
          </button>
        </div>
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

      {/* Modal overlay */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-navy/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-steel max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-navy p-6 flex justify-between items-center text-white">
              <h3 className="font-heading font-bold text-lg">Add New Vehicle</h3>
              <button onClick={() => setIsAddOpen(false)} className="hover:text-orange transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddVehicle} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Vehicle Model *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Toyota HiAce (Van)"
                  value={newVehicle.model}
                  onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                  className="w-full border border-steel rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange text-navy"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Plate Registration *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GHA-8821-22"
                  value={newVehicle.plate}
                  onChange={(e) => setNewVehicle({ ...newVehicle, plate: e.target.value })}
                  className="w-full border border-steel rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange text-navy"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Assigned Driver *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Chinedu Obi"
                  value={newVehicle.driver}
                  onChange={(e) => setNewVehicle({ ...newVehicle, driver: e.target.value })}
                  className="w-full border border-steel rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange text-navy"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Fuel Level (%)</label>
                  <input
                    type="text"
                    placeholder="e.g. 75%"
                    value={newVehicle.fuel}
                    onChange={(e) => setNewVehicle({ ...newVehicle, fuel: e.target.value })}
                    className="w-full border border-steel rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange text-navy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Next Service Date</label>
                  <input
                    type="date"
                    value={newVehicle.maintenance}
                    onChange={(e) => setNewVehicle({ ...newVehicle, maintenance: e.target.value })}
                    className="w-full border border-steel rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange text-navy"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Operational Status</label>
                <select
                  value={newVehicle.status}
                  onChange={(e) => setNewVehicle({ ...newVehicle, status: e.target.value })}
                  className="w-full border border-steel rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange text-navy bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="In Transit">In Transit</option>
                  <option value="Maintenance">Maintenance</option>
                </select>
              </div>
              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-steel text-navy rounded-lg font-bold hover:bg-steel-dark transition text-sm text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-orange text-white rounded-lg font-bold hover:bg-orange-light transition text-sm text-center"
                >
                  Add Vehicle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
