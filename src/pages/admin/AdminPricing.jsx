import React, { useState, useEffect } from "react";
import { Plus, Edit2, CircleDollarSign, Calculator, CalculatorIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

export default function AdminPricing() {
  const { toast } = useToast();
  const [pricingRules, setPricingRules] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({
    delivery_type: "standard",
    base_price: "",
    price_per_kg: "",
    price_per_km: "",
    speed_multiplier: "1.0",
    route_id: "",
    is_active: true
  });
  
  const [saving, setSaving] = useState(false);

  // Live Calculator State
  const [calcForm, setCalcForm] = useState({
    delivery_type: "standard",
    route_id: "",
    weight_kg: 1
  });
  const [calculatedPrice, setCalculatedPrice] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    const { data: pricingData } = await supabase
      .from("pricing_rules")
      .select(`*, routes ( route_name, origin, destination )`)
      .order("created_at", { ascending: false });
      
    if (pricingData) setPricingRules(pricingData);

    const { data: routeData } = await supabase
      .from("routes")
      .select("id, route_name, distance_km")
      .eq("is_active", true);
      
    if (routeData) setRoutes(routeData);

    setLoading(false);
  };

  const handleOpenNew = () => {
    setEditingId(null);
    setForm({
      delivery_type: "standard",
      base_price: "",
      price_per_kg: "",
      price_per_km: "",
      speed_multiplier: "1.0",
      route_id: "",
      is_active: true
    });
    setIsSheetOpen(true);
  };

  const handleOpenEdit = (rule) => {
    setEditingId(rule.id);
    setForm({
      delivery_type: rule.delivery_type,
      base_price: rule.base_price,
      price_per_kg: rule.price_per_kg,
      price_per_km: rule.price_per_km,
      speed_multiplier: rule.speed_multiplier,
      route_id: rule.route_id || "",
      is_active: rule.is_active
    });
    setIsSheetOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      delivery_type: form.delivery_type,
      base_price: parseFloat(form.base_price || 0),
      price_per_kg: parseFloat(form.price_per_kg || 0),
      price_per_km: parseFloat(form.price_per_km || 0),
      speed_multiplier: parseFloat(form.speed_multiplier || 1),
      route_id: form.route_id || null,
      is_active: form.is_active
    };

    try {
      if (editingId) {
        const { error } = await supabase
          .from("pricing_rules")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
        toast({ title: "Success", description: "Pricing rule updated." });
      } else {
        const { error } = await supabase
          .from("pricing_rules")
          .insert(payload);
        if (error) throw error;
        toast({ title: "Success", description: "New pricing rule added." });
      }
      
      setIsSheetOpen(false);
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      const { error } = await supabase
        .from("pricing_rules")
        .update({ is_active: !currentStatus })
        .eq("id", id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  // Run Calculator
  useEffect(() => {
    if (!calcForm.route_id || !calcForm.delivery_type) {
      setCalculatedPrice(null);
      return;
    }

    const route = routes.find(r => r.id === calcForm.route_id);
    if (!route) return;

    // Find applicable rule (specific route overrides general rule)
    let rule = pricingRules.find(r => r.route_id === calcForm.route_id && r.delivery_type === calcForm.delivery_type && r.is_active);
    
    if (!rule) {
      // Fallback to general rule (route_id is null)
      rule = pricingRules.find(r => !r.route_id && r.delivery_type === calcForm.delivery_type && r.is_active);
    }

    if (!rule) {
      setCalculatedPrice(-1); // Indicator for no rule found
      return;
    }

    const base = parseFloat(rule.base_price);
    const weightCost = (parseFloat(calcForm.weight_kg) || 0) * parseFloat(rule.price_per_kg);
    const distCost = (parseFloat(route.distance_km) || 0) * parseFloat(rule.price_per_km);
    
    const total = (base + weightCost + distCost) * parseFloat(rule.speed_multiplier);
    setCalculatedPrice(total.toFixed(2));
  }, [calcForm, routes, pricingRules]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-black text-navy">Pricing & Tariffs</h1>
          <p className="text-muted-foreground mt-1">Configure automated pricing logic for routes and package types.</p>
        </div>
        <button 
          onClick={handleOpenNew}
          className="flex items-center gap-2 px-4 py-2 bg-orange text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-orange-light transition"
        >
          <Plus size={16} /> Add Rule
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        
        {/* Rules Table */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-steel overflow-hidden shadow-sm flex flex-col">
          <div className="p-4 border-b border-steel bg-slate-50 font-heading font-bold text-navy flex items-center gap-2">
            <CircleDollarSign size={18} className="text-orange" /> Pricing Rules
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-steel text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Route Scope</th>
                  <th className="px-4 py-3">Base</th>
                  <th className="px-4 py-3">/kg</th>
                  <th className="px-4 py-3">/km</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-10 text-center">
                      <div className="flex justify-center"><div className="w-6 h-6 border-2 border-steel border-t-orange rounded-full animate-spin" /></div>
                    </td>
                  </tr>
                ) : pricingRules.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 py-10 text-center text-muted-foreground">
                      No pricing rules found.
                    </td>
                  </tr>
                ) : (
                  pricingRules.map(rule => (
                    <tr key={rule.id} className={`hover:bg-slate-50 transition-colors ${!rule.is_active && 'opacity-50'}`}>
                      <td className="px-4 py-3 font-bold text-navy capitalize">{rule.delivery_type}</td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {rule.route_id ? <span className="text-orange font-semibold">{rule.routes?.route_name || "Specific Route"}</span> : "All Routes"}
                      </td>
                      <td className="px-4 py-3 font-mono">${rule.base_price}</td>
                      <td className="px-4 py-3 font-mono">${rule.price_per_kg}</td>
                      <td className="px-4 py-3 font-mono">${rule.price_per_km}</td>
                      <td className="px-4 py-3 text-right flex justify-end gap-2">
                        <button
                          onClick={() => toggleStatus(rule.id, rule.is_active)}
                          className={`text-xs font-bold uppercase tracking-wider ${rule.is_active ? 'text-red-500 hover:text-red-600' : 'text-green-500 hover:text-green-600'}`}
                        >
                          {rule.is_active ? 'Disable' : 'Enable'}
                        </button>
                        <button onClick={() => handleOpenEdit(rule)} className="text-orange hover:text-orange-light"><Edit2 size={16} /></button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Calculator */}
        <div className="bg-white rounded-xl border border-steel overflow-hidden shadow-sm">
           <div className="p-4 border-b border-steel bg-slate-50 font-heading font-bold text-navy flex items-center gap-2">
            <CalculatorIcon size={18} className="text-blue-500" /> Live Preview
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">Delivery Type</label>
              <select
                value={calcForm.delivery_type}
                onChange={e => setCalcForm({...calcForm, delivery_type: e.target.value})}
                className="w-full px-3 py-2 border border-steel rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="standard">Standard</option>
                <option value="express">Express</option>
                <option value="same-day">Same-Day</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">Route</label>
              <select
                value={calcForm.route_id}
                onChange={e => setCalcForm({...calcForm, route_id: e.target.value})}
                className="w-full px-3 py-2 border border-steel rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              >
                <option value="">-- Select Route --</option>
                {routes.map(r => (
                  <option key={r.id} value={r.id}>{r.route_name} ({r.distance_km} km)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">Weight (kg)</label>
              <input
                type="number"
                min="0.1" step="0.1"
                value={calcForm.weight_kg}
                onChange={e => setCalcForm({...calcForm, weight_kg: e.target.value})}
                className="w-full px-3 py-2 border border-steel rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1">Calculated Price</p>
              {calculatedPrice === null ? (
                <p className="text-sm font-semibold text-slate-400">Select route to preview</p>
              ) : calculatedPrice === -1 ? (
                <p className="text-sm font-semibold text-red-500">No active pricing rule available for this combination.</p>
              ) : (
                <p className="text-3xl font-heading font-black text-blue-600">${calculatedPrice}</p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Slide-in Drawer via Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md w-full bg-white border-l border-steel p-0 overflow-y-auto">
          <div className="p-6 bg-navy text-white">
            <SheetHeader>
              <SheetTitle className="text-white text-xl font-heading font-black">
                {editingId ? "Edit Pricing Rule" : "New Pricing Rule"}
              </SheetTitle>
            </SheetHeader>
          </div>

          <div className="p-6">
            <form onSubmit={handleSave} className="space-y-5">
              
              <div>
                <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">Delivery Type</label>
                <select
                  value={form.delivery_type}
                  onChange={e => setForm({...form, delivery_type: e.target.value})}
                  className="w-full px-3 py-2 border border-steel rounded-lg outline-none focus:border-orange focus:ring-1 focus:ring-orange"
                >
                  <option value="standard">Standard</option>
                  <option value="express">Express</option>
                  <option value="same-day">Same-Day</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">Route Scope</label>
                <select
                  value={form.route_id}
                  onChange={e => setForm({...form, route_id: e.target.value})}
                  className="w-full px-3 py-2 border border-steel rounded-lg outline-none focus:border-orange focus:ring-1 focus:ring-orange"
                >
                  <option value="">Apply to ALL routes</option>
                  {routes.map(r => (
                    <option key={r.id} value={r.id}>Specific Route: {r.route_name}</option>
                  ))}
                </select>
                <p className="text-[10px] text-muted-foreground mt-1">Specific route rules override "All routes" rules.</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">Base Price ($)</label>
                  <input
                    required type="number" step="0.01" min="0"
                    value={form.base_price}
                    onChange={e => setForm({...form, base_price: e.target.value})}
                    className="w-full px-3 py-2 border border-steel rounded-lg font-mono outline-none focus:border-orange focus:ring-1 focus:ring-orange"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">Price per Kg ($)</label>
                  <input
                    required type="number" step="0.01" min="0"
                    value={form.price_per_kg}
                    onChange={e => setForm({...form, price_per_kg: e.target.value})}
                    className="w-full px-3 py-2 border border-steel rounded-lg font-mono outline-none focus:border-orange focus:ring-1 focus:ring-orange"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">Price per Km ($)</label>
                  <input
                    required type="number" step="0.01" min="0"
                    value={form.price_per_km}
                    onChange={e => setForm({...form, price_per_km: e.target.value})}
                    className="w-full px-3 py-2 border border-steel rounded-lg font-mono outline-none focus:border-orange focus:ring-1 focus:ring-orange"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">Speed Multiplier</label>
                  <input
                    required type="number" step="0.01" min="0"
                    value={form.speed_multiplier}
                    onChange={e => setForm({...form, speed_multiplier: e.target.value})}
                    className="w-full px-3 py-2 border border-steel rounded-lg font-mono outline-none focus:border-orange focus:ring-1 focus:ring-orange"
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-steel mt-6">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 bg-orange text-white rounded-lg font-bold uppercase tracking-wider hover:bg-orange-light transition-colors disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Pricing Rule"}
                </button>
              </div>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
