import React, { useEffect, useState } from "react";
import { Building2, Edit2, MapPin, Plus, Route as RouteIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const EMPTY_LOCATION = {
  name: "",
  address: "",
  city: "",
  state: "",
  is_active: true,
};

const EMPTY_ROUTE = {
  route_name: "",
  origin: "",
  destination: "",
  transit_days: "",
  distance_km: "",
  is_active: true,
};

export default function AdminLocations() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("locations");
  const [locations, setLocations] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetType, setSheetType] = useState("location");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_LOCATION);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [locationsResult, routesResult] = await Promise.all([
      supabase.from("locations").select("*").order("created_at", { ascending: false }),
      supabase.from("routes").select("*").order("created_at", { ascending: false }),
    ]);

    if (locationsResult.error || routesResult.error) {
      toast({
        title: "Network configuration unavailable",
        description: locationsResult.error?.message || routesResult.error?.message,
        variant: "destructive",
      });
    }

    setLocations(locationsResult.data || []);
    setRoutes(routesResult.data || []);
    setLoading(false);
  };

  const openNew = () => {
    const type = activeTab === "locations" ? "location" : "route";
    setSheetType(type);
    setEditingId(null);
    setForm(type === "location" ? { ...EMPTY_LOCATION } : { ...EMPTY_ROUTE });
    setSheetOpen(true);
  };

  const openLocationEdit = (location) => {
    setSheetType("location");
    setEditingId(location.id);
    setForm({
      name: location.name,
      address: location.address,
      city: location.city,
      state: location.state || "",
      is_active: location.is_active,
    });
    setSheetOpen(true);
  };

  const openRouteEdit = (route) => {
    setSheetType("route");
    setEditingId(route.id);
    setForm({
      route_name: route.route_name,
      origin: route.origin,
      destination: route.destination,
      transit_days: route.transit_days ?? "",
      distance_km: route.distance_km ?? "",
      is_active: route.is_active,
    });
    setSheetOpen(true);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const table = sheetType === "location" ? "locations" : "routes";
      const payload = sheetType === "location"
        ? {
            name: form.name.trim(),
            address: form.address.trim(),
            city: form.city.trim(),
            state: form.state.trim() || null,
            is_active: form.is_active,
          }
        : {
            route_name: form.route_name.trim(),
            origin: form.origin.trim(),
            destination: form.destination.trim(),
            transit_days: form.transit_days === "" ? null : Number(form.transit_days),
            distance_km: form.distance_km === "" ? null : Number(form.distance_km),
            is_active: form.is_active,
          };

      const query = editingId
        ? supabase.from(table).update(payload).eq("id", editingId)
        : supabase.from(table).insert(payload);
      const { error } = await query;

      if (error) throw error;

      toast({
        title: editingId ? "Configuration updated" : "Configuration created",
        description: `${sheetType === "location" ? "Location" : "Route"} saved successfully.`,
      });
      setSheetOpen(false);
      await fetchData();
    } catch (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (table, id, currentStatus) => {
    const { error } = await supabase
      .from(table)
      .update({ is_active: !currentStatus })
      .eq("id", id);

    if (error) {
      toast({ title: "Status update failed", description: error.message, variant: "destructive" });
      return;
    }

    await fetchData();
  };

  const isLocationsTab = activeTab === "locations";

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-black text-navy">Locations, Hubs & Routes</h1>
          <p className="text-muted-foreground mt-1">
            Configure operational locations and the routes used by bookings, pricing, and tracking.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange text-white rounded-lg text-sm font-bold uppercase tracking-wider hover:bg-orange-light transition"
        >
          <Plus size={16} /> {isLocationsTab ? "Add Location" : "Add Route"}
        </button>
      </div>

      <div className="inline-flex p-1 bg-slate-100 border border-steel rounded-xl mt-8">
        <TabButton
          active={isLocationsTab}
          onClick={() => setActiveTab("locations")}
          icon={Building2}
          label={`Locations / Hubs (${locations.length})`}
        />
        <TabButton
          active={!isLocationsTab}
          onClick={() => setActiveTab("routes")}
          icon={RouteIcon}
          label={`Routes (${routes.length})`}
        />
      </div>

      {isLocationsTab ? (
        <LocationsTable
          locations={locations}
          loading={loading}
          onEdit={openLocationEdit}
          onToggle={(id, status) => toggleStatus("locations", id, status)}
        />
      ) : (
        <RoutesTable
          routes={routes}
          loading={loading}
          onEdit={openRouteEdit}
          onToggle={(id, status) => toggleStatus("routes", id, status)}
        />
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md w-full bg-white border-l border-steel p-0 overflow-y-auto">
          <div className="p-6 bg-navy text-white">
            <SheetHeader>
              <SheetTitle className="text-white text-xl font-heading font-black">
                {editingId ? "Edit" : "New"} {sheetType === "location" ? "Location" : "Route"}
              </SheetTitle>
            </SheetHeader>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-5">
            {sheetType === "location" ? (
              <LocationForm form={form} setForm={setForm} />
            ) : (
              <RouteForm form={form} setForm={setForm} />
            )}

            <label className="flex items-center gap-3 pt-4 border-t border-steel">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(event) => setForm((current) => ({ ...current, is_active: event.target.checked }))}
                className="w-4 h-4 text-orange focus:ring-orange border-steel rounded"
              />
              <span className="text-sm font-semibold text-navy">
                {sheetType === "location" ? "Location" : "Route"} is active and available
              </span>
            </label>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 bg-orange text-white rounded-lg font-bold uppercase tracking-wider hover:bg-orange-light disabled:opacity-50"
            >
              {saving ? "Saving..." : `Save ${sheetType === "location" ? "Location" : "Route"}`}
            </button>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
        active ? "bg-white text-navy shadow-sm" : "text-muted-foreground hover:text-navy"
      }`}
    >
      <Icon size={15} className={active ? "text-orange" : ""} />
      {label}
    </button>
  );
}

function LocationsTable({ locations, loading, onEdit, onToggle }) {
  return (
    <div className="mt-6 bg-white rounded-xl border border-steel overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-steel text-muted-foreground font-semibold uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-4">Hub Name</th>
              <th className="px-6 py-4">Address</th>
              <th className="px-6 py-4">City / State</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel">
            {loading ? (
              <LoadingRow columns={5} />
            ) : locations.length === 0 ? (
              <EmptyRow columns={5} message="No locations configured. Add the first operational hub." />
            ) : (
              locations.map((location) => (
                <tr key={location.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange/10 text-orange flex items-center justify-center">
                        <MapPin size={14} />
                      </div>
                      <span className="font-bold text-navy">{location.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{location.address}</td>
                  <td className="px-6 py-4 font-semibold text-navy">
                    {location.city}{location.state ? `, ${location.state}` : ""}
                  </td>
                  <td className="px-6 py-4">
                    <StatusButton active={location.is_active} onClick={() => onToggle(location.id, location.is_active)} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <EditButton onClick={() => onEdit(location)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function RoutesTable({ routes, loading, onEdit, onToggle }) {
  return (
    <div className="mt-6 bg-white rounded-xl border border-steel overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-steel text-muted-foreground font-semibold uppercase tracking-wider text-xs">
            <tr>
              <th className="px-6 py-4">Route</th>
              <th className="px-6 py-4">Origin</th>
              <th className="px-6 py-4">Destination</th>
              <th className="px-6 py-4">Distance</th>
              <th className="px-6 py-4">Transit</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-steel">
            {loading ? (
              <LoadingRow columns={7} />
            ) : routes.length === 0 ? (
              <EmptyRow columns={7} message="No routes configured. Add a route to use it in booking, pricing, and tracking." />
            ) : (
              routes.map((route) => (
                <tr key={route.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 font-bold text-navy">{route.route_name}</td>
                  <td className="px-6 py-4 text-muted-foreground">{route.origin}</td>
                  <td className="px-6 py-4 text-muted-foreground">{route.destination}</td>
                  <td className="px-6 py-4 font-mono">{route.distance_km == null ? "—" : `${route.distance_km} km`}</td>
                  <td className="px-6 py-4">{route.transit_days == null ? "—" : `${route.transit_days} day${route.transit_days === 1 ? "" : "s"}`}</td>
                  <td className="px-6 py-4">
                    <StatusButton active={route.is_active} onClick={() => onToggle(route.id, route.is_active)} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <EditButton onClick={() => onEdit(route)} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function LocationForm({ form, setForm }) {
  return (
    <>
      <Field label="Location Name" required value={form.name} onChange={(value) => setForm((current) => ({ ...current, name: value }))} placeholder="e.g. Festac Main Office" />
      <Field label="Street Address" required value={form.address} onChange={(value) => setForm((current) => ({ ...current, address: value }))} />
      <div className="grid grid-cols-2 gap-4">
        <Field label="City" required value={form.city} onChange={(value) => setForm((current) => ({ ...current, city: value }))} />
        <Field label="State / Region" value={form.state} onChange={(value) => setForm((current) => ({ ...current, state: value }))} />
      </div>
    </>
  );
}

function RouteForm({ form, setForm }) {
  return (
    <>
      <Field label="Route Name" required value={form.route_name} onChange={(value) => setForm((current) => ({ ...current, route_name: value }))} placeholder="e.g. Festac to Ikeja" />
      <Field label="Origin" required value={form.origin} onChange={(value) => setForm((current) => ({ ...current, origin: value }))} placeholder="Festac, Lagos" />
      <Field label="Destination" required value={form.destination} onChange={(value) => setForm((current) => ({ ...current, destination: value }))} placeholder="Ikeja, Lagos" />
      <div className="grid grid-cols-2 gap-4">
        <Field label="Distance (km)" type="number" min="0" step="0.01" value={form.distance_km} onChange={(value) => setForm((current) => ({ ...current, distance_km: value }))} />
        <Field label="Transit Days" type="number" min="0" step="1" value={form.transit_days} onChange={(value) => setForm((current) => ({ ...current, transit_days: value }))} />
      </div>
    </>
  );
}

function Field({ label, onChange, ...props }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">{label}</span>
      <input
        {...props}
        onChange={(event) => onChange(event.target.value)}
        className="w-full px-3 py-2.5 border border-steel rounded-lg outline-none focus:border-orange focus:ring-1 focus:ring-orange font-medium"
      />
    </label>
  );
}

function StatusButton({ active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full ${
        active ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-red-100 text-red-700 hover:bg-red-200"
      }`}
    >
      {active ? "Active" : "Inactive"}
    </button>
  );
}

function EditButton({ onClick }) {
  return (
    <button type="button" onClick={onClick} className="text-orange hover:text-orange-light p-2" aria-label="Edit">
      <Edit2 size={16} />
    </button>
  );
}

function LoadingRow({ columns }) {
  return (
    <tr>
      <td colSpan={columns} className="px-6 py-10 text-center">
        <div className="w-6 h-6 border-2 border-steel border-t-orange rounded-full animate-spin mx-auto" />
      </td>
    </tr>
  );
}

function EmptyRow({ columns, message }) {
  return (
    <tr>
      <td colSpan={columns} className="px-6 py-10 text-center text-muted-foreground">{message}</td>
    </tr>
  );
}
