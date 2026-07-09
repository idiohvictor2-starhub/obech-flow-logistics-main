import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, MapPin } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function AdminLocations() {
  const { toast } = useToast();
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    is_active: true
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("locations")
      .select("*")
      .order("created_at", { ascending: false });
      
    if (data) setLocations(data);
    setLoading(false);
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setForm({ name: "", address: "", city: "", state: "", is_active: true });
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (loc) => {
    setEditingId(loc.id);
    setForm({
      name: loc.name,
      address: loc.address,
      city: loc.city,
      state: loc.state || "",
      is_active: loc.is_active
    });
    setIsSheetOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingId) {
        const { error } = await supabase
          .from("locations")
          .update(form)
          .eq("id", editingId);
        if (error) throw error;
        toast({ title: "Success", description: "Location updated." });
      } else {
        const { error } = await supabase
          .from("locations")
          .insert(form);
        if (error) throw error;
        toast({ title: "Success", description: "New location added." });
      }
      
      setIsSheetOpen(false);
      fetchLocations();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from("locations")
        .update({ is_active: !currentStatus })
        .eq("id", id);
      if (error) throw error;
      fetchLocations();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-black text-navy">Locations / Hubs</h1>
          <p className="text-muted-foreground mt-1">Manage network hubs, warehouses, and delivery centers.</p>
        </div>
        <button 
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-4 py-2 bg-orange text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-orange-light transition"
        >
          <Plus size={16} /> Add Location
        </button>
      </div>

      <div className="mt-8 bg-white rounded-xl border border-steel overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-steel text-muted-foreground font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Hub Name</th>
                <th className="px-6 py-4">Address</th>
                <th className="px-6 py-4">City/State</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center">
                    <div className="flex justify-center"><div className="w-6 h-6 border-2 border-steel border-t-orange rounded-full animate-spin" /></div>
                  </td>
                </tr>
              ) : locations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-muted-foreground">
                    No locations found. Add one to get started.
                  </td>
                </tr>
              ) : (
                locations.map(loc => (
                  <tr key={loc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange/10 flex items-center justify-center text-orange">
                          <MapPin size={14} />
                        </div>
                        <span className="font-bold text-navy">{loc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {loc.address}
                    </td>
                    <td className="px-6 py-4 text-navy font-semibold">
                      {loc.city}{loc.state ? `, ${loc.state}` : ''}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleStatus(loc.id, loc.is_active)}
                        className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full transition-colors ${
                          loc.is_active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {loc.is_active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleOpenEdit(loc)}
                        className="text-orange hover:text-orange-light p-2"
                      >
                        <Edit2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-in Drawer via Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md w-full bg-white border-l border-steel p-0">
          <div className="p-6 bg-navy text-white">
            <SheetHeader>
              <SheetTitle className="text-white text-xl font-heading font-black">
                {editingId ? "Edit Location" : "New Location"}
              </SheetTitle>
            </SheetHeader>
          </div>

          <div className="p-6">
            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">Location Name</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-3 py-2.5 border border-steel rounded-lg outline-none focus:border-orange focus:ring-1 focus:ring-orange font-medium"
                  placeholder="e.g. London Central Hub"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">Street Address</label>
                <input
                  required
                  type="text"
                  value={form.address}
                  onChange={e => setForm({...form, address: e.target.value})}
                  className="w-full px-3 py-2.5 border border-steel rounded-lg outline-none focus:border-orange focus:ring-1 focus:ring-orange font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">City</label>
                  <input
                    required
                    type="text"
                    value={form.city}
                    onChange={e => setForm({...form, city: e.target.value})}
                    className="w-full px-3 py-2.5 border border-steel rounded-lg outline-none focus:border-orange focus:ring-1 focus:ring-orange font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">State/Region</label>
                  <input
                    type="text"
                    value={form.state}
                    onChange={e => setForm({...form, state: e.target.value})}
                    className="w-full px-3 py-2.5 border border-steel rounded-lg outline-none focus:border-orange focus:ring-1 focus:ring-orange font-medium"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-3 pt-4 border-t border-steel mt-4">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={form.is_active}
                  onChange={e => setForm({...form, is_active: e.target.checked})}
                  className="w-4 h-4 text-orange focus:ring-orange border-steel rounded"
                />
                <label htmlFor="isActive" className="text-sm font-semibold text-navy">Location is active and operational</label>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-orange text-white rounded-lg font-bold uppercase tracking-wider hover:bg-orange-light transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Location"}
                </button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
