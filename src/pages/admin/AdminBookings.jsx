import React, { useState, useEffect } from "react";
import { Search, Filter, MoreVertical, MapPin, Truck, Calendar, Clock, Download, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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

export default function AdminBookings() {
  const { toast } = useToast();
  const [shipments, setShipments] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  const [updateForm, setUpdateForm] = useState({
    status: "",
    status_note: "",
    driver_id: ""
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    // Fetch shipments with relations
    const { data: shipmentsData } = await supabase
      .from("shipments")
      .select(`
        *,
        routes ( route_name, origin, destination ),
        drivers ( full_name, phone )
      `)
      .order("created_at", { ascending: false });

    if (shipmentsData) setShipments(shipmentsData);

    // Fetch drivers for assignment
    const { data: driversData } = await supabase
      .from("drivers")
      .select("id, full_name")
      .eq("is_active", true);
      
    if (driversData) setDrivers(driversData);
    
    setLoading(false);
  };

  const handleOpenSheet = (shipment) => {
    setSelectedShipment(shipment);
    setUpdateForm({
      status: shipment.status,
      status_note: "",
      driver_id: shipment.driver_id || ""
    });
    setIsSheetOpen(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const adminName = user?.email || "Admin";

      // 1. Update Shipment
      const updateData = {
        status: updateForm.status,
        driver_id: updateForm.driver_id || null
      };

      // Only add status_note if provided (optional internal note)
      if (updateForm.status_note) {
        updateData.status_note = updateForm.status_note;
      }

      const { error: updateError } = await supabase
        .from("shipments")
        .update(updateData)
        .eq("id", selectedShipment.id);

      if (updateError) throw updateError;

      // 2. Insert into status_history if status changed or note added
      if (updateForm.status !== selectedShipment.status || updateForm.status_note) {
        const { error: historyError } = await supabase
          .from("status_history")
          .insert({
            shipment_id: selectedShipment.id,
            status: updateForm.status,
            note: updateForm.status_note || `Status updated to ${updateForm.status}`,
            updated_by: adminName
          });

        if (historyError) throw historyError;
      }

      toast({ title: "Shipment Updated", description: "Changes saved to database." });
      setIsSheetOpen(false);
      fetchData(); // Refresh list

    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const filteredShipments = shipments.filter(s => {
    const matchesSearch = (s.tracking_id?.toLowerCase() || "").includes(search.toLowerCase()) ||
                          (s.client_name?.toLowerCase() || "").includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered": return "bg-green-100 text-green-700";
      case "failed": return "bg-red-100 text-red-700";
      case "out_for_delivery": return "bg-amber-100 text-amber-700";
      case "in_transit": return "bg-blue-100 text-blue-700";
      case "picked_up": return "bg-amber-50 text-amber-600";
      case "confirmed": return "bg-blue-50 text-blue-600";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const exportCSV = () => {
    const headers = ["Tracking ID", "Client", "Route", "Status", "Date"];
    const rows = filteredShipments.map(s => [
      s.tracking_id,
      s.client_name,
      s.routes ? `${s.routes.origin} to ${s.routes.destination}` : "",
      s.status,
      format(new Date(s.created_at), "yyyy-MM-dd HH:mm")
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `shipments_export_${format(new Date(), "yyyyMMdd")}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-black text-navy">Master Shipments</h1>
          <p className="text-muted-foreground mt-1">Manage all logistics bookings, assign drivers, and update statuses.</p>
        </div>
        <button 
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-steel rounded-lg text-sm font-semibold hover:bg-slate-50 transition"
        >
          <Download size={16} /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mt-8">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by Tracking ID or Client Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-steel focus:border-orange focus:ring-1 focus:ring-orange outline-none"
          />
        </div>
        <div className="relative w-full md:w-64 shrink-0">
          <Filter size={18} className="absolute left-3 top-3 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-steel appearance-none focus:border-orange focus:ring-1 focus:ring-orange outline-none bg-white"
          >
            <option value="all">All Statuses</option>
            {STATUSES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="mt-6 bg-white rounded-xl border border-steel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-steel text-muted-foreground font-semibold uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Tracking ID</th>
                <th className="px-6 py-4">Client</th>
                <th className="px-6 py-4">Route</th>
                <th className="px-6 py-4">Driver</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-steel">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center">
                    <div className="flex justify-center"><div className="w-6 h-6 border-2 border-steel border-t-orange rounded-full animate-spin" /></div>
                  </td>
                </tr>
              ) : filteredShipments.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-muted-foreground">
                    No shipments found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredShipments.map(shipment => (
                  <tr key={shipment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-navy">{shipment.tracking_id}</td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-navy">{shipment.client_name}</p>
                      <p className="text-xs text-muted-foreground">{shipment.client_email}</p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      {shipment.routes ? `${shipment.routes.origin} → ${shipment.routes.destination}` : "—"}
                    </td>
                    <td className="px-6 py-4">
                      {shipment.drivers ? <span className="text-navy font-medium">{shipment.drivers.full_name}</span> : <span className="text-orange text-xs font-semibold uppercase">Unassigned</span>}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${getStatusColor(shipment.status)}`}>
                        {shipment.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                      {format(new Date(shipment.created_at), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleOpenSheet(shipment)}
                        className="text-orange hover:text-orange-light font-semibold text-sm"
                      >
                        Manage
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
        <SheetContent className="sm:max-w-md md:max-w-xl overflow-y-auto w-full bg-white border-l border-steel z-[100] shadow-2xl p-0">
          {selectedShipment && (
            <div className="flex flex-col h-full">
              {/* Drawer Header */}
              <div className="p-6 bg-navy text-white relative">
                <SheetHeader>
                  <SheetTitle className="text-white text-xl font-heading font-black">Shipment Details</SheetTitle>
                </SheetHeader>
                <div className="mt-4">
                  <p className="text-xs text-orange font-mono uppercase tracking-widest">Tracking ID</p>
                  <p className="text-2xl font-mono font-bold">{selectedShipment.tracking_id}</p>
                </div>
              </div>

              {/* Drawer Body */}
              <div className="p-6 flex-1 bg-slate-50 overflow-y-auto space-y-8">
                
                {/* Summary Info */}
                <div className="bg-white rounded-xl border border-steel p-5 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Client</p>
                    <p className="font-bold text-navy mt-1">{selectedShipment.client_name}</p>
                    <p className="text-muted-foreground">{selectedShipment.client_email}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Package Type</p>
                    <p className="font-bold text-navy mt-1 capitalize">{selectedShipment.package_type || "—"}</p>
                    <p className="text-muted-foreground">{selectedShipment.weight_kg ? `${selectedShipment.weight_kg} kg` : ""}</p>
                  </div>
                  <div className="col-span-2 mt-2 pt-4 border-t border-steel">
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Route Overview</p>
                    <div className="flex items-center gap-3 mt-2 font-semibold text-navy">
                      <span>{selectedShipment.sender_address}</span>
                      <Truck size={14} className="text-orange" />
                      <span>{selectedShipment.receiver_address}</span>
                    </div>
                  </div>
                </div>

                {/* Update Form */}
                <div>
                  <h3 className="font-heading font-black text-navy uppercase tracking-wide mb-4">Status & Dispatch</h3>
                  <form onSubmit={handleUpdate} className="bg-white rounded-xl border border-steel p-5 space-y-5">
                    <div>
                      <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">Assign Driver</label>
                      <select
                        value={updateForm.driver_id}
                        onChange={(e) => setUpdateForm({ ...updateForm, driver_id: e.target.value })}
                        className="w-full px-3 py-2 border border-steel rounded-lg outline-none focus:border-orange focus:ring-1 focus:ring-orange"
                      >
                        <option value="">-- Unassigned --</option>
                        {drivers.map(d => (
                          <option key={d.id} value={d.id}>{d.full_name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">Shipment Status</label>
                      <select
                        value={updateForm.status}
                        onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                        className="w-full px-3 py-2 border border-steel rounded-lg outline-none focus:border-orange focus:ring-1 focus:ring-orange font-bold text-navy"
                      >
                        {STATUSES.map(s => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">Admin Note (Internal)</label>
                      <textarea
                        value={updateForm.status_note}
                        onChange={(e) => setUpdateForm({ ...updateForm, status_note: e.target.value })}
                        placeholder="Add an internal note about this status change..."
                        rows={3}
                        className="w-full px-3 py-2 border border-steel rounded-lg outline-none focus:border-orange focus:ring-1 focus:ring-orange text-sm resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={updating}
                      className="w-full py-3 bg-orange text-white rounded-lg font-bold uppercase tracking-wider hover:bg-orange-light transition-colors disabled:opacity-50"
                    >
                      {updating ? "Saving..." : "Update Shipment"}
                    </button>
                    <p className="text-[10px] text-center text-muted-foreground mt-2">
                      Updates to status will trigger an email to the client automatically.
                    </p>
                  </form>
                </div>

              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}