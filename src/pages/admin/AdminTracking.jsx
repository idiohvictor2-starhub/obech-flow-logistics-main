import React, { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Copy,
  ExternalLink,
  Filter,
  Loader2,
  MapPin,
  Package,
  RefreshCw,
  Search,
  Truck,
  UserRound,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

const STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "picked_up", label: "Picked Up" },
  { value: "in_transit", label: "In Transit" },
  { value: "out_for_delivery", label: "Out for Delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "failed", label: "Failed" },
];

const ACTIVE_STATUSES = new Set([
  "confirmed",
  "picked_up",
  "in_transit",
  "out_for_delivery",
]);

const initialUpdateForm = {
  status: "pending",
  route_id: "",
  driver_id: "",
  estimated_delivery: "",
  customer_note: "",
};

const statusLabel = (status) =>
  STATUSES.find((item) => item.value === status)?.label || status?.replaceAll("_", " ") || "Unknown";

const statusClasses = (status) => {
  switch (status) {
    case "delivered":
      return "bg-green-100 text-green-700";
    case "failed":
      return "bg-red-100 text-red-700";
    case "out_for_delivery":
      return "bg-amber-100 text-amber-700";
    case "in_transit":
      return "bg-blue-100 text-blue-700";
    case "picked_up":
      return "bg-violet-100 text-violet-700";
    case "confirmed":
      return "bg-cyan-100 text-cyan-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

export default function AdminTracking() {
  const { toast } = useToast();
  const [shipments, setShipments] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updateForm, setUpdateForm] = useState(initialUpdateForm);

  const fetchData = useCallback(async ({ silent = false } = {}) => {
    if (silent) setRefreshing(true);
    else setLoading(true);

    const [shipmentsResult, driversResult, routesResult] = await Promise.all([
      supabase
        .from("shipments")
        .select(`
          *,
          routes ( route_name, origin, destination ),
          drivers ( full_name, phone )
        `)
        .order("updated_at", { ascending: false }),
      supabase
        .from("drivers")
        .select("id, full_name, phone")
        .eq("is_active", true)
        .order("full_name"),
      supabase
        .from("routes")
        .select("id, route_name, origin, destination")
        .eq("is_active", true)
        .order("route_name"),
    ]);

    if (shipmentsResult.error) {
      toast({
        title: "Tracking data unavailable",
        description: shipmentsResult.error.message,
        variant: "destructive",
      });
    } else {
      setShipments(shipmentsResult.data || []);
    }

    if (!driversResult.error) setDrivers(driversResult.data || []);
    if (!routesResult.error) setRoutes(routesResult.data || []);

    setLoading(false);
    setRefreshing(false);
  }, [toast]);

  const handleClearTrackingHistory = async () => {
    if (!window.confirm("Are you sure you want to permanently clear all shipment tracking history? This will delete all history entries but keep your shipments.")) {
      return;
    }
    try {
      setRefreshing(true);
      const { error } = await supabase
        .from("status_history")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (error) throw error;
      toast({
        title: "Tracking History Cleared",
        description: "All shipment tracking logs have been deleted successfully.",
      });
      await fetchData({ silent: true });
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("admin-tracking-control")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shipments" },
        () => fetchData({ silent: true })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const metrics = useMemo(() => {
    const today = format(new Date(), "yyyy-MM-dd");
    return {
      active: shipments.filter((shipment) => ACTIVE_STATUSES.has(shipment.status)).length,
      outForDelivery: shipments.filter((shipment) => shipment.status === "out_for_delivery").length,
      deliveredToday: shipments.filter(
        (shipment) =>
          shipment.status === "delivered" &&
          format(new Date(shipment.updated_at || shipment.created_at), "yyyy-MM-dd") === today
      ).length,
      exceptions: shipments.filter((shipment) => shipment.status === "failed").length,
    };
  }, [shipments]);

  const filteredShipments = useMemo(() => {
    const query = search.trim().toLowerCase();
    return shipments.filter((shipment) => {
      const matchesSearch =
        !query ||
        shipment.tracking_id?.toLowerCase().includes(query) ||
        shipment.client_name?.toLowerCase().includes(query) ||
        shipment.client_phone?.toLowerCase().includes(query) ||
        shipment.receiver_name?.toLowerCase().includes(query);
      const matchesStatus = statusFilter === "all" || shipment.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, shipments, statusFilter]);

  const loadHistory = async (shipmentId) => {
    setHistoryLoading(true);
    const { data, error } = await supabase
      .from("status_history")
      .select("*")
      .eq("shipment_id", shipmentId)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "History unavailable",
        description: error.message,
        variant: "destructive",
      });
      setHistory([]);
    } else {
      setHistory(data || []);
    }
    setHistoryLoading(false);
  };

  const openShipment = (shipment) => {
    setSelectedShipment(shipment);
    setUpdateForm({
      status: shipment.status || "pending",
      route_id: shipment.route_id || "",
      driver_id: shipment.driver_id || "",
      estimated_delivery: shipment.estimated_delivery || "",
      customer_note: "",
    });
    setHistory([]);
    setSheetOpen(true);
    loadHistory(shipment.id);
  };

  const trackingUrl = (shipment) => {
    const url = new URL("/track", window.location.origin);
    url.searchParams.set("id", shipment.tracking_id);
    return url.toString();
  };

  const copyTrackingLink = async () => {
    try {
      await navigator.clipboard.writeText(trackingUrl(selectedShipment));
      toast({ title: "Tracking link copied", description: "The public tracking link is ready to share." });
    } catch {
      toast({
        title: "Could not copy link",
        description: "Copy the tracking ID manually and share it with the customer.",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    if (!selectedShipment) return;

    setSaving(true);
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Your admin session has expired. Please sign in again.");
      }

      const statusChanged = updateForm.status !== selectedShipment.status;
      const customerNote = updateForm.customer_note.trim();
      const updateData = {
        status: updateForm.status,
        route_id: updateForm.route_id || null,
        driver_id: updateForm.driver_id || null,
        estimated_delivery: updateForm.estimated_delivery || null,
      };

      if (statusChanged || customerNote) {
        updateData.status_note = customerNote || `Shipment status updated to ${statusLabel(updateForm.status)}.`;
      }

      const { error: updateError } = await supabase
        .from("shipments")
        .update(updateData)
        .eq("id", selectedShipment.id);

      if (updateError) throw updateError;

      if (statusChanged || customerNote) {
        const { error: historyError } = await supabase
          .from("status_history")
          .insert({
            shipment_id: selectedShipment.id,
            status: updateForm.status,
            note: customerNote || `Shipment status updated to ${statusLabel(updateForm.status)}.`,
            updated_by: user.email || "Tracking Admin",
          });

        if (historyError) throw historyError;
      }

      toast({
        title: "Tracking updated",
        description: `${selectedShipment.tracking_id} is now ${statusLabel(updateForm.status)}.`,
      });
      setSheetOpen(false);
      await fetchData({ silent: true });
    } catch (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-black text-navy">Tracking Control</h1>
          <p className="text-muted-foreground mt-1">
            Monitor shipment movement, update delivery progress, and share customer tracking links.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleClearTrackingHistory}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 rounded-lg text-sm font-bold text-white hover:bg-red-700 transition"
          >
            <Trash2 size={16} />
            Clear History
          </button>
          <button
            type="button"
            onClick={() => fetchData({ silent: true })}
            disabled={refreshing}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-steel rounded-lg text-sm font-bold text-navy hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-8">
        <MetricCard label="Active Shipments" value={metrics.active} icon={Truck} tone="blue" />
        <MetricCard label="Out for Delivery" value={metrics.outForDelivery} icon={MapPin} tone="amber" />
        <MetricCard label="Delivered Today" value={metrics.deliveredToday} icon={CheckCircle2} tone="green" />
        <MetricCard label="Exceptions" value={metrics.exceptions} icon={AlertTriangle} tone="red" />
      </div>

      <div className="flex flex-col md:flex-row gap-4 mt-8">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search tracking ID, customer, phone, or recipient..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-steel bg-white outline-none focus:border-orange focus:ring-1 focus:ring-orange"
          />
        </div>
        <div className="relative w-full md:w-64">
          <Filter size={18} className="absolute left-3 top-3 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-steel bg-white outline-none focus:border-orange focus:ring-1 focus:ring-orange appearance-none"
          >
            <option value="all">All Statuses</option>
            {STATUSES.map((status) => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 bg-white rounded-xl border border-steel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-steel text-muted-foreground font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-5 py-4">Tracking ID</th>
                <th className="px-5 py-4">Customer</th>
                <th className="px-5 py-4">Route</th>
                <th className="px-5 py-4">Driver</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Last Update</th>
                <th className="px-5 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center">
                    <Loader2 size={24} className="animate-spin text-orange mx-auto" />
                  </td>
                </tr>
              ) : filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-12 text-center text-muted-foreground">
                    No shipments match the current tracking filters.
                  </td>
                </tr>
              ) : (
                filteredShipments.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-navy whitespace-nowrap">
                      {shipment.tracking_id}
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-semibold text-navy">{shipment.client_name}</p>
                      <p className="text-xs text-muted-foreground">{shipment.client_phone || shipment.client_email || "—"}</p>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground min-w-48">
                      {shipment.routes
                        ? `${shipment.routes.origin} → ${shipment.routes.destination}`
                        : "Not assigned"}
                    </td>
                    <td className="px-5 py-4">
                      {shipment.drivers?.full_name || <span className="text-orange text-xs font-bold uppercase">Unassigned</span>}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${statusClasses(shipment.status)}`}>
                        {statusLabel(shipment.status)}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground whitespace-nowrap">
                      {format(new Date(shipment.updated_at || shipment.created_at), "MMM dd, yyyy h:mm a")}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => openShipment(shipment)}
                        className="text-orange hover:text-orange-light font-bold"
                      >
                        Update
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-xl lg:max-w-2xl overflow-y-auto w-full bg-slate-50 border-l border-steel p-0">
          {selectedShipment && (
            <div className="min-h-full">
              <div className="bg-navy text-white p-6">
                <SheetHeader>
                  <SheetTitle className="text-white text-xl font-heading font-black">Shipment Tracking Update</SheetTitle>
                </SheetHeader>
                <p className="mt-4 text-xs text-orange uppercase tracking-widest font-bold">Tracking ID</p>
                <p className="font-mono text-2xl font-bold mt-1">{selectedShipment.tracking_id}</p>
                <div className="flex flex-wrap gap-3 mt-5">
                  <button
                    type="button"
                    onClick={copyTrackingLink}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-xs font-bold hover:bg-white/15"
                  >
                    <Copy size={14} /> Copy Customer Link
                  </button>
                  <button
                    type="button"
                    onClick={() => window.open(trackingUrl(selectedShipment), "_blank", "noopener,noreferrer")}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 border border-white/15 text-xs font-bold hover:bg-white/15"
                  >
                    <ExternalLink size={14} /> Open Public Tracker
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="bg-white rounded-xl border border-steel p-5 grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
                  <Info label="Customer" value={selectedShipment.client_name} icon={UserRound} />
                  <Info label="Recipient" value={selectedShipment.receiver_name} icon={Package} />
                  <Info label="Pickup" value={selectedShipment.sender_address} icon={MapPin} />
                  <Info label="Delivery" value={selectedShipment.receiver_address} icon={MapPin} />
                </div>

                <form onSubmit={handleUpdate} className="bg-white rounded-xl border border-steel p-5 space-y-5">
                  <h3 className="font-heading font-black text-navy uppercase tracking-wide">Update Tracking</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <SelectField
                      label="Shipment Status"
                      value={updateForm.status}
                      onChange={(value) => setUpdateForm((current) => ({ ...current, status: value }))}
                    >
                      {STATUSES.map((status) => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </SelectField>

                    <SelectField
                      label="Assigned Driver"
                      value={updateForm.driver_id}
                      onChange={(value) => setUpdateForm((current) => ({ ...current, driver_id: value }))}
                    >
                      <option value="">Unassigned</option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>{driver.full_name}</option>
                      ))}
                    </SelectField>

                    <SelectField
                      label="Route"
                      value={updateForm.route_id}
                      onChange={(value) => setUpdateForm((current) => ({ ...current, route_id: value }))}
                    >
                      <option value="">No route assigned</option>
                      {routes.map((route) => (
                        <option key={route.id} value={route.id}>
                          {route.route_name} — {route.origin} to {route.destination}
                        </option>
                      ))}
                    </SelectField>

                    <label className="block text-sm">
                      <span className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">Estimated Delivery</span>
                      <input
                        type="date"
                        value={updateForm.estimated_delivery}
                        onChange={(event) => setUpdateForm((current) => ({ ...current, estimated_delivery: event.target.value }))}
                        className="w-full px-3 py-2.5 border border-steel rounded-lg outline-none focus:border-orange focus:ring-1 focus:ring-orange"
                      />
                    </label>
                  </div>

                  <label className="block text-sm">
                    <span className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">Customer Update Note</span>
                    <textarea
                      value={updateForm.customer_note}
                      onChange={(event) => setUpdateForm((current) => ({ ...current, customer_note: event.target.value }))}
                      placeholder="Example: Your shipment left our Festac hub and is on the way to the destination."
                      rows={4}
                      className="w-full px-3 py-2.5 border border-steel rounded-lg outline-none focus:border-orange focus:ring-1 focus:ring-orange resize-none"
                    />
                    <span className="block text-xs text-muted-foreground mt-2">
                      This note appears in the customer&apos;s tracking history. Do not include internal information.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full py-3 bg-orange text-white rounded-lg font-bold uppercase tracking-wider hover:bg-orange-light disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving && <Loader2 size={17} className="animate-spin" />}
                    {saving ? "Saving Tracking Update..." : "Save Tracking Update"}
                  </button>
                </form>

                <div className="bg-white rounded-xl border border-steel p-5">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="font-heading font-black text-navy uppercase tracking-wide">Status History</h3>
                    <span className="text-xs text-muted-foreground">{history.length} updates</span>
                  </div>

                  {historyLoading ? (
                    <Loader2 size={22} className="animate-spin text-orange mx-auto my-8" />
                  ) : history.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">No tracking history has been recorded.</p>
                  ) : (
                    <div className="mt-5 space-y-4">
                      {history.map((item) => (
                        <div key={item.id} className="flex gap-3 border-l-2 border-orange pl-4 py-1">
                          <Clock3 size={16} className="text-orange shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-bold text-navy">{statusLabel(item.status)}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {format(new Date(item.created_at), "MMM dd, yyyy h:mm a")} · {item.updated_by}
                            </p>
                            {item.note && <p className="text-sm text-slate-600 mt-2">{item.note}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, tone }) {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className="bg-white border border-steel rounded-xl p-5 flex items-center justify-between gap-4">
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-3xl font-heading font-black text-navy mt-2">{value}</p>
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${tones[tone]}`}>
        <Icon size={21} />
      </div>
    </div>
  );
}

function Info({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-navy/5 text-orange flex items-center justify-center shrink-0">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-navy mt-1 break-words">{value || "—"}</p>
      </div>
    </div>
  );
}

function SelectField({ label, value, onChange, children }) {
  return (
    <label className="block text-sm">
      <span className="block text-xs font-bold text-navy uppercase tracking-wider mb-2">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full px-3 py-2.5 border border-steel rounded-lg bg-white outline-none focus:border-orange focus:ring-1 focus:ring-orange"
      >
        {children}
      </select>
    </label>
  );
}
