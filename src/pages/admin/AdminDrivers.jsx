import React, { useState, useEffect } from "react";
import { Truck, Search, ShieldCheck, Navigation, Plus, Edit2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function AdminDrivers() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({
    full_name: "",
    phone: "",
    email: "",
    vehicle_type: "",
    license_plate: "",
    zone: "",
    availability: "available",
    is_active: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("drivers")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (data) setDrivers(data);
    setLoading(false);
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setForm({
      full_name: "", phone: "", email: "", vehicle_type: "", 
      license_plate: "", zone: "", availability: "available", is_active: true
    });
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (drv) => {
    setEditingId(drv.id);
    setForm({
      full_name: drv.full_name,
      phone: drv.phone,
      email: drv.email || "",
      vehicle_type: drv.vehicle_type || "",
      license_plate: drv.license_plate || "",
      zone: drv.zone || "",
      availability: drv.availability,
      is_active: drv.is_active
    });
    setIsSheetOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        const { error } = await supabase
          .from("drivers")
          .update(form)
          .eq("id", editingId);
        if (error) throw error;
        toast({ title: "Success", description: "Driver updated." });
      } else {
        const { error } = await supabase
          .from("drivers")
          .insert(form);
        if (error) throw error;
        toast({ title: "Success", description: "New driver added." });
      }
      
      setIsSheetOpen(false);
      fetchDrivers();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const filtered = drivers.filter(
    (d) =>
      d.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.vehicle_type || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.license_plate || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-black text-navy">Drivers & Riders</h1>
          <p className="text-muted-foreground mt-1">
            Monitor status, licensing and vehicle assignments for field dispatch staff.
          </p>
        </div>
        <button 
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-4 py-2 bg-orange text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-orange-light transition"
        >
          <Plus size={16} /> Add Driver
        </button>
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
              {drivers.filter((d) => d.availability === "available" && d.is_active).length}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Available</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-steel flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
            <Navigation size={22} />
          </div>
          <div>
            <div className="text-2xl font-heading font-black text-navy">
              {drivers.filter((d) => d.availability === "on_delivery").length}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">On Delivery</div>
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
              placeholder="Search drivers by name, vehicle or license plate..."
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
                <th className="px-6 py-4">Vehicle Type</th>
                <th className="px-6 py-4">License Plate</th>
                <th className="px-6 py-4">Availability</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center">
                    <div className="flex justify-center"><div className="w-6 h-6 border-2 border-steel border-t-orange rounded-full animate-spin" /></div>
                  </td>
                </tr>
              ) : filtered.length > 0 ? (
                filtered.map((drv) => (
                  <tr key={drv.id} className="hover:bg-steel/10 transition-colors text-sm text-navy">
                    <td className="px-6 py-4">
                      <div className="font-bold">{drv.full_name}</div>
                      <div className="text-xs text-muted-foreground font-mono mt-0.5">{drv.phone}</div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-muted-foreground capitalize">{drv.vehicle_type || "—"}</td>
                    <td className="px-6 py-4 font-mono text-xs">{drv.license_plate || "—"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                          drv.availability === "on_delivery"
                            ? "bg-blue-100 text-blue-800"
                            : drv.availability === "available"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {drv.availability.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {drv.is_active ? (
                        <span className="text-green-600 font-bold text-xs uppercase tracking-wider">Active</span>
                      ) : (
                        <span className="text-red-500 font-bold text-xs uppercase tracking-wider">Inactive</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleOpenEdit(drv)} className="text-orange hover:text-orange-light font-bold text-xs uppercase tracking-wider p-2">
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-muted-foreground">
                    No drivers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-in Drawer via Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md w-full bg-white border-l border-steel p-0 overflow-y-auto">
          <div className="p-6 bg-navy text-white">
            <SheetHeader>
              <SheetTitle className="text-white text-xl font-heading font-black">
                {editingId ? "Edit Driver" : "New Driver"}
              </SheetTitle>
            </SheetHeader>
          </div>

          <div className="p-6">
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">Full Name</label>
                <input
                  required type="text"
                  value={form.full_name}
                  onChange={e => setForm({...form, full_name: e.target.value})}
                  className="w-full px-3 py-2.5 border border-steel rounded-lg outline-none focus:border-orange focus:ring-1 focus:ring-orange font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">Phone</label>
                  <input
                    required type="text"
                    value={form.phone}
                    onChange={e => setForm({...form, phone: e.target.value})}
                    className="w-full px-3 py-2.5 border border-steel rounded-lg outline-none focus:border-orange focus:ring-1 focus:ring-orange font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})}
                    className="w-full px-3 py-2.5 border border-steel rounded-lg outline-none focus:border-orange focus:ring-1 focus:ring-orange font-medium"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">Vehicle Type</label>
                  <input
                    type="text" placeholder="e.g. Van, Bike"
                    value={form.vehicle_type}
                    onChange={e => setForm({...form, vehicle_type: e.target.value})}
                    className="w-full px-3 py-2.5 border border-steel rounded-lg outline-none focus:border-orange focus:ring-1 focus:ring-orange font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">License Plate</label>
                  <input
                    type="text"
                    value={form.license_plate}
                    onChange={e => setForm({...form, license_plate: e.target.value})}
                    className="w-full px-3 py-2.5 border border-steel rounded-lg outline-none focus:border-orange focus:ring-1 focus:ring-orange font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">Availability</label>
                <select
                  value={form.availability}
                  onChange={e => setForm({...form, availability: e.target.value})}
                  className="w-full px-3 py-2 border border-steel rounded-lg outline-none focus:border-orange focus:ring-1 focus:ring-orange"
                >
                  <option value="available">Available</option>
                  <option value="on_delivery">On Delivery</option>
                  <option value="off_duty">Off Duty</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-steel mt-4">
                <input
                  type="checkbox"
                  id="drvActive"
                  checked={form.is_active}
                  onChange={e => setForm({...form, is_active: e.target.checked})}
                  className="w-4 h-4 text-orange focus:ring-orange border-steel rounded"
                />
                <label htmlFor="drvActive" className="text-sm font-semibold text-navy">Driver account is active</label>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-orange text-white rounded-lg font-bold uppercase tracking-wider hover:bg-orange-light transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Driver"}
                </button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
