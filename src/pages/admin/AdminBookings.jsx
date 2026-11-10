import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  Download,
  Plus,
  Printer,
  Trash2,
  CreditCard,
  ClipboardList,
  CheckCircle2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { format } from "date-fns";
import { useToast } from "@/components/ui/use-toast";
import AdminOfficeBookingDialog from "@/components/admin/AdminOfficeBookingDialog";
import {
  formatNaira,
  formatServiceType,
  printBookingReceipt,
  SERVICE_TYPES,
} from "@/utils/printBookingReceipt";
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

const PAYMENT_STATUSES = [
  { value: "unpaid", label: "Unpaid" },
  { value: "partial", label: "Partial" },
  { value: "paid", label: "Paid" },
];

const generateReceiptReference = () => {
  const year = new Date().getFullYear();
  const timePart = Date.now().toString().slice(-6);
  const randomPart = Math.floor(100 + Math.random() * 900);
  return `OBR-${year}-${timePart}${randomPart}`;
};

export default function AdminBookings() {
  const { toast } = useToast();
  const [shipments, setShipments] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("bookings"); // "bookings" | "payments"
  const [drawerTab, setDrawerTab] = useState("dispatch"); // "dispatch" | "payment"

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  const [selectedShipment, setSelectedShipment] = useState(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [updateForm, setUpdateForm] = useState({
    status: "",
    status_note: "",
    driver_id: "",
    delivery_type: "Air Express",
  });

  const [paymentForm, setPaymentForm] = useState({
    payment_enabled: true,
    payment_status: "unpaid",
    total_amount: "",
    amount_paid: "0",
    payment_method: "bank_transfer",
    payment_reference: "",
    delivery_type: "Air Express",
  });

  const [updating, setUpdating] = useState(false);
  const [savingPayment, setSavingPayment] = useState(false);

  useEffect(() => {
    fetchData();

    const channel = supabase
      .channel("admin-bookings-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "shipments" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleClearBookings = async () => {
    if (!window.confirm("Are you sure you want to permanently delete all bookings? This action is irreversible.")) {
      return;
    }
    try {
      setLoading(true);
      const { error } = await supabase
        .from("shipments")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000");

      if (error) throw error;
      toast({
        title: "Bookings Cleared",
        description: "All booking records have been deleted successfully.",
      });
      fetchData();
    } catch (err) {
      toast({
        title: "Error clearing bookings",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async () => {
    setLoading(true);

    const { data: shipmentsData } = await supabase
      .from("shipments")
      .select(`
        *,
        routes ( route_name, origin, destination ),
        drivers ( full_name, phone )
      `)
      .order("created_at", { ascending: false });

    if (shipmentsData) setShipments(shipmentsData);

    const { data: driversData } = await supabase
      .from("drivers")
      .select("id, full_name")
      .eq("is_active", true);

    if (driversData) setDrivers(driversData);

    const { data: routesData } = await supabase
      .from("routes")
      .select("id, route_name, origin, destination")
      .eq("is_active", true)
      .order("route_name");

    if (routesData) setRoutes(routesData);

    setLoading(false);
  };

  const handleOpenSheet = (shipment, initialDrawerTab = "dispatch") => {
    setSelectedShipment(shipment);
    const normalizedServiceType = formatServiceType(shipment.delivery_type);
    setUpdateForm({
      status: shipment.status,
      status_note: "",
      driver_id: shipment.driver_id || "",
      delivery_type: SERVICE_TYPES.includes(normalizedServiceType)
        ? normalizedServiceType
        : "Air Express",
    });
    const hasPaymentInfo =
      Boolean(shipment.receipt_number) ||
      Number(shipment.total_amount) > 0 ||
      Number(shipment.amount_paid) > 0;
    setPaymentForm({
      payment_enabled: hasPaymentInfo || initialDrawerTab === "payment",
      payment_status: shipment.payment_status || "unpaid",
      total_amount:
        shipment.total_amount !== null && shipment.total_amount !== undefined
          ? String(shipment.total_amount)
          : "",
      amount_paid:
        shipment.amount_paid !== null && shipment.amount_paid !== undefined
          ? String(shipment.amount_paid)
          : "0",
      payment_method: shipment.payment_method || "bank_transfer",
      payment_reference: shipment.payment_reference || "",
      delivery_type: SERVICE_TYPES.includes(normalizedServiceType)
        ? normalizedServiceType
        : "Air Express",
    });
    setDrawerTab(initialDrawerTab);
    setIsSheetOpen(true);
  };

  const handlePrintReceipt = (shipment) => {
    if (!printBookingReceipt(shipment)) {
      toast({
        title: "Print window blocked",
        description: "Allow pop-ups for this site, then select Receipt again.",
        variant: "destructive",
      });
    }
  };

  const handlePaymentFieldChange = (field, value) => {
    setPaymentForm((prev) => {
      const next = { ...prev, [field]: value };
      const total = Number(next.total_amount) || 0;
      let paid = Number(next.amount_paid) || 0;

      if (field === "payment_status") {
        if (value === "paid") {
          next.amount_paid = String(total);
        } else if (value === "unpaid") {
          next.amount_paid = "0";
        } else if (value === "partial" && paid >= total && total > 0) {
          next.amount_paid = String(Math.max(total - 1, 0));
        }
      } else if (field === "total_amount") {
        if (next.payment_status === "paid") {
          next.amount_paid = String(total);
        } else if (paid > total) {
          next.amount_paid = String(total);
        }
      } else if (field === "amount_paid") {
        if (paid <= 0) {
          next.payment_status = "unpaid";
        } else if (paid < total) {
          next.payment_status = "partial";
        } else if (total > 0 && paid >= total) {
          next.payment_status = "paid";
          next.amount_paid = String(total);
        }
      }
      return next;
    });
  };

  const handleSavePayment = async (e) => {
    e.preventDefault();
    if (!selectedShipment) return;

    const total = paymentForm.payment_enabled ? Number(paymentForm.total_amount) || 0 : 0;
    let paid = paymentForm.payment_enabled ? Number(paymentForm.amount_paid) || 0 : 0;
    const status = paymentForm.payment_enabled ? paymentForm.payment_status : "unpaid";

    if (status === "paid" && total > 0) {
      paid = total;
    } else if (status === "unpaid") {
      paid = 0;
    }

    if (total < 0 || paid < 0 || paid > total) {
      toast({
        title: "Invalid payment amounts",
        description: "Amount paid cannot be negative or exceed the total booking amount.",
        variant: "destructive",
      });
      return;
    }

    setSavingPayment(true);
    try {
      const receiptNumber =
        selectedShipment.receipt_number ||
        (paymentForm.payment_enabled ? generateReceiptReference() : null);

      const updatePayload = {
        total_amount: total,
        amount_paid: paid,
        payment_status: status,
        payment_method: paid > 0 ? paymentForm.payment_method : null,
        payment_reference: paymentForm.payment_reference?.trim() || null,
        receipt_number: receiptNumber,
        delivery_type: paymentForm.delivery_type,
      };

      const { data: updatedShipment, error } = await supabase
        .from("shipments")
        .update(updatePayload)
        .eq("id", selectedShipment.id)
        .select(`
          *,
          routes ( route_name, origin, destination ),
          drivers ( full_name, phone )
        `)
        .single();

      if (error) throw error;

      setSelectedShipment(updatedShipment);
      setUpdateForm((prev) => ({
        ...prev,
        delivery_type: formatServiceType(updatedShipment.delivery_type),
      }));
      toast({
        title: "Payment & Amount Updated",
        description: `Payment status (${status.toUpperCase()}) and amount (${formatNaira(total)}) saved.`,
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Failed to save payment",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSavingPayment(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      const adminName = user?.email || "Admin";

      const updateData = {
        status: updateForm.status,
        driver_id: updateForm.driver_id || null,
        delivery_type: updateForm.delivery_type,
      };

      if (updateForm.status_note) {
        updateData.status_note = updateForm.status_note;
      }

      const { error: updateError } = await supabase
        .from("shipments")
        .update(updateData)
        .eq("id", selectedShipment.id);

      if (updateError) throw updateError;

      if (updateForm.status !== selectedShipment.status || updateForm.status_note) {
        const { error: historyError } = await supabase
          .from("status_history")
          .insert({
            shipment_id: selectedShipment.id,
            status: updateForm.status,
            note: updateForm.status_note || `Status updated to ${updateForm.status}`,
            updated_by: adminName,
          });

        if (historyError) throw historyError;
      }

      toast({ title: "Shipment Updated", description: "Changes saved to database." });
      setIsSheetOpen(false);
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setUpdating(false);
    }
  };

  const filteredShipments = shipments.filter((s) => {
    const matchesSearch =
      (s.tracking_id?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (s.client_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
      (s.receipt_number?.toLowerCase() || "").includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || s.status === statusFilter;
    const matchesPayment =
      paymentFilter === "all" || (s.payment_status || "unpaid") === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
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

  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case "paid": return "bg-green-100 text-green-700";
      case "partial": return "bg-amber-100 text-amber-700";
      default: return "bg-red-100 text-red-700";
    }
  };

  const exportCSV = () => {
    const headers = [
      "Tracking ID",
      "Client",
      "Service Type",
      "Payment Status",
      "Total Amount",
      "Amount Paid",
      "Status",
      "Date",
    ];
    const rows = filteredShipments.map((s) => [
      s.tracking_id,
      s.client_name,
      formatServiceType(s.delivery_type),
      (s.payment_status || "unpaid").toUpperCase(),
      Number(s.total_amount) || 0,
      Number(s.amount_paid) || 0,
      s.status,
      format(new Date(s.created_at), "yyyy-MM-dd HH:mm"),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      headers.join(",") +
      "\n" +
      rows.map((e) => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `shipments_export_${format(new Date(), "yyyyMMdd")}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const computedBalance = Math.max(
    (Number(paymentForm.total_amount) || 0) - (Number(paymentForm.amount_paid) || 0),
    0
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-black text-navy">Master Shipments</h1>
          <p className="text-muted-foreground mt-1">
            Manage all logistics bookings, service types, payment statuses, amounts, and statuses.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange text-white rounded-lg text-sm font-bold hover:bg-orange-light transition"
          >
            <Plus size={16} /> New Office Booking
          </button>
          <button
            type="button"
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-steel rounded-lg text-sm font-semibold hover:bg-slate-50 transition"
          >
            <Download size={16} /> Export CSV
          </button>
          <button
            type="button"
            onClick={handleClearBookings}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition"
          >
            <Trash2 size={16} /> Clear Bookings
          </button>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="mt-6 flex flex-wrap gap-2 border-b border-steel">
        <button
          type="button"
          onClick={() => setActiveTab("bookings")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-heading font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === "bookings"
              ? "border-orange text-orange bg-orange/5"
              : "border-transparent text-muted-foreground hover:text-navy"
          }`}
        >
          <ClipboardList size={16} />
          All Bookings ({shipments.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("payments")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-heading font-bold uppercase tracking-wider border-b-2 transition-colors ${
            activeTab === "payments"
              ? "border-orange text-orange bg-orange/5"
              : "border-transparent text-muted-foreground hover:text-navy"
          }`}
        >
          <CreditCard size={16} />
          Payment Status & Amount
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mt-6">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-3 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by Tracking ID, Receipt No, or Client Name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-steel focus:border-orange focus:ring-1 focus:ring-orange outline-none bg-white"
          />
        </div>
        <div className="relative w-full md:w-56 shrink-0">
          <Filter size={18} className="absolute left-3 top-3 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-steel appearance-none focus:border-orange focus:ring-1 focus:ring-orange outline-none bg-white"
          >
            <option value="all">All Shipment Statuses</option>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="relative w-full md:w-56 shrink-0">
          <CreditCard size={18} className="absolute left-3 top-3 text-muted-foreground" />
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-steel appearance-none focus:border-orange focus:ring-1 focus:ring-orange outline-none bg-white"
          >
            <option value="all">All Payment Statuses</option>
            {PAYMENT_STATUSES.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bookings & Payment Table */}
      {activeTab === "bookings" ? (
        <div className="mt-6 bg-white rounded-xl border border-steel overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-steel text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Tracking ID</th>
                  <th className="px-6 py-4">Client</th>
                  <th className="px-6 py-4">Service Type</th>
                  <th className="px-6 py-4">Payment</th>
                  <th className="px-6 py-4">Driver</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-10 text-center">
                      <div className="flex justify-center">
                        <div className="w-6 h-6 border-2 border-steel border-t-orange rounded-full animate-spin" />
                      </div>
                    </td>
                  </tr>
                ) : filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-10 text-center text-muted-foreground">
                      No shipments found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map((shipment) => (
                    <tr key={shipment.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-navy">{shipment.tracking_id}</td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-navy">{shipment.client_name}</p>
                        <p className="text-xs text-muted-foreground">{shipment.client_email || shipment.client_phone}</p>
                      </td>
                      <td className="px-6 py-4 font-medium text-navy">
                        {formatServiceType(shipment.delivery_type)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getPaymentStatusColor(
                              shipment.payment_status
                            )}`}
                          >
                            {shipment.payment_status || "unpaid"}
                          </span>
                          <span className="text-xs font-semibold text-navy">
                            {formatNaira(shipment.total_amount)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {shipment.drivers ? (
                          <span className="text-navy font-medium">{shipment.drivers.full_name}</span>
                        ) : (
                          <span className="text-orange text-xs font-semibold uppercase">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${getStatusColor(
                            shipment.status
                          )}`}
                        >
                          {shipment.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground whitespace-nowrap">
                        {format(new Date(shipment.created_at), "MMM dd, yyyy")}
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap space-x-3">
                        <button
                          type="button"
                          onClick={() => handlePrintReceipt(shipment)}
                          className="text-navy hover:text-orange font-semibold text-sm"
                        >
                          Receipt
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenSheet(shipment, "payment")}
                          className="text-emerald-700 hover:text-emerald-800 font-semibold text-sm"
                        >
                          Payment
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenSheet(shipment, "dispatch")}
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
      ) : (
        /* Dedicated Payment Status & Amount Tab */
        <div className="mt-6 bg-white rounded-xl border border-steel overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-steel flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-heading font-black text-navy uppercase tracking-wider">
                Booking Payment Status & Amount Control
              </h2>
              <p className="text-xs text-muted-foreground">
                Enable and update payment status, booking charge, amount paid, and service type for any booking.
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-steel text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Tracking / Receipt</th>
                  <th className="px-6 py-4">Customer</th>
                  <th className="px-6 py-4">Service Type</th>
                  <th className="px-6 py-4">Payment Status</th>
                  <th className="px-6 py-4">Total Amount</th>
                  <th className="px-6 py-4">Amount Paid</th>
                  <th className="px-6 py-4">Balance</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-steel">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-10 text-center">
                      <div className="flex justify-center">
                        <div className="w-6 h-6 border-2 border-steel border-t-orange rounded-full animate-spin" />
                      </div>
                    </td>
                  </tr>
                ) : filteredShipments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-6 py-10 text-center text-muted-foreground">
                      No bookings found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredShipments.map((shipment) => {
                    const total = Number(shipment.total_amount) || 0;
                    const paid = Number(shipment.amount_paid) || 0;
                    const balance = Math.max(total - paid, 0);
                    return (
                      <tr key={shipment.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-mono font-bold text-navy">{shipment.tracking_id}</p>
                          <p className="font-mono text-xs text-muted-foreground">
                            {shipment.receipt_number || "No receipt # yet"}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-navy">{shipment.client_name}</p>
                          <p className="text-xs text-muted-foreground">{shipment.client_phone}</p>
                        </td>
                        <td className="px-6 py-4 font-semibold text-navy">
                          {formatServiceType(shipment.delivery_type)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${getPaymentStatusColor(
                              shipment.payment_status
                            )}`}
                          >
                            {shipment.payment_status || "unpaid"}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-bold text-navy">{formatNaira(total)}</td>
                        <td className="px-6 py-4 font-semibold text-emerald-700">{formatNaira(paid)}</td>
                        <td className="px-6 py-4 font-semibold text-amber-700">{formatNaira(balance)}</td>
                        <td className="px-6 py-4 text-right whitespace-nowrap space-x-3">
                          <button
                            type="button"
                            onClick={() => handleOpenSheet(shipment, "payment")}
                            className="px-3 py-1.5 rounded-lg bg-orange text-white text-xs font-bold hover:bg-orange-light transition"
                          >
                            Set Payment & Amount
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePrintReceipt(shipment)}
                            className="px-3 py-1.5 rounded-lg border border-steel bg-white text-navy text-xs font-bold hover:bg-slate-50 transition"
                          >
                            Print Receipt
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Slide-in Drawer via Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="sm:max-w-md md:max-w-xl overflow-y-auto w-full bg-white border-l border-steel z-[100] shadow-2xl p-0">
          {selectedShipment && (
            <div className="flex flex-col h-full">
              {/* Drawer Header */}
              <div className="p-6 bg-navy text-white relative">
                <SheetHeader>
                  <SheetTitle className="text-white text-xl font-heading font-black">
                    Shipment Details
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs text-orange font-mono uppercase tracking-widest">Tracking ID</p>
                    <p className="text-2xl font-mono font-bold">{selectedShipment.tracking_id}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded text-xs font-bold uppercase ${getPaymentStatusColor(
                      selectedShipment.payment_status
                    )}`}
                  >
                    {(selectedShipment.payment_status || "unpaid").toUpperCase()}
                  </span>
                </div>

                {/* Drawer Tabs */}
                <div className="flex gap-2 mt-6 border-t border-white/10 pt-4">
                  <button
                    type="button"
                    onClick={() => setDrawerTab("dispatch")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                      drawerTab === "dispatch"
                        ? "bg-orange text-white"
                        : "bg-white/10 text-white/70 hover:text-white hover:bg-white/15"
                    }`}
                  >
                    Status & Dispatch
                  </button>
                  <button
                    type="button"
                    onClick={() => setDrawerTab("payment")}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition ${
                      drawerTab === "payment"
                        ? "bg-orange text-white"
                        : "bg-white/10 text-white/70 hover:text-white hover:bg-white/15"
                    }`}
                  >
                    Payment & Amount
                  </button>
                </div>
              </div>

              {/* Drawer Body */}
              <div className="p-6 flex-1 bg-slate-50 overflow-y-auto space-y-6">
                {/* Summary Info */}
                <div className="bg-white rounded-xl border border-steel p-5 space-y-6 text-sm">
                  <div className="flex justify-between items-center pb-3 border-b border-steel">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Booking Source</p>
                      <span
                        className={`inline-block px-2.5 py-1 rounded text-xs font-bold uppercase mt-1 ${
                          selectedShipment.booking_source === "online"
                            ? "bg-indigo-100 text-indigo-700"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {selectedShipment.booking_source || "office"}
                      </span>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold text-right">
                        Service Type
                      </p>
                      <p className="font-bold text-navy mt-1 text-right">
                        {formatServiceType(selectedShipment.delivery_type)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pb-4 border-b border-steel">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold">
                        Sender Details (Origin)
                      </p>
                      <p className="font-bold text-navy mt-1">{selectedShipment.client_name}</p>
                      <p className="text-muted-foreground text-xs">{selectedShipment.client_email}</p>
                      <p className="text-muted-foreground text-xs">{selectedShipment.client_phone}</p>
                      <p className="text-navy text-xs mt-2 font-medium bg-slate-50 p-2 rounded border border-steel">
                        <span className="font-semibold">Address:</span> {selectedShipment.sender_address}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold">
                        Receiver Details (Destination)
                      </p>
                      <p className="font-bold text-navy mt-1">{selectedShipment.receiver_name || "—"}</p>
                      <p className="text-muted-foreground text-xs">{selectedShipment.receiver_phone || "—"}</p>
                      <p className="text-navy text-xs mt-2 font-medium bg-slate-50 p-2 rounded border border-steel">
                        <span className="font-semibold">Address:</span> {selectedShipment.receiver_address}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Name of Items</p>
                      <p className="font-bold text-navy mt-1">{selectedShipment.package_type || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Weight (kg)</p>
                      <p className="font-bold text-navy mt-1">
                        {selectedShipment.weight_kg ? `${selectedShipment.weight_kg} kg` : "—"}
                      </p>
                    </div>
                  </div>

                  {selectedShipment.special_instructions && (
                    <div className="mt-2 pt-4 border-t border-steel">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">
                        Notes / Instructions
                      </p>
                      <p className="text-navy text-xs mt-1 bg-slate-50 p-3 rounded border border-steel italic leading-relaxed">
                        {selectedShipment.special_instructions}
                      </p>
                    </div>
                  )}
                </div>

                {drawerTab === "payment" ? (
                  /* Payment Status & Amount Form Tab */
                  <div className="space-y-6">
                    <form
                      onSubmit={handleSavePayment}
                      className="bg-white rounded-xl border border-steel p-5 space-y-5"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-steel">
                        <div>
                          <h3 className="font-heading font-black text-navy uppercase tracking-wide">
                            Payment Status & Amount
                          </h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Enable and configure billing amount and payment status for this booking.
                          </p>
                        </div>
                        <label className="inline-flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={paymentForm.payment_enabled}
                            onChange={(e) =>
                              handlePaymentFieldChange("payment_enabled", e.target.checked)
                            }
                            className="w-4 h-4 accent-orange rounded"
                          />
                          <span className="text-xs font-bold text-navy uppercase">Enable</span>
                        </label>
                      </div>

                      {paymentForm.payment_enabled && (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">
                                Service Type
                              </label>
                              <select
                                value={paymentForm.delivery_type}
                                onChange={(e) =>
                                  handlePaymentFieldChange("delivery_type", e.target.value)
                                }
                                className="w-full px-3 py-2.5 border border-steel rounded-lg outline-none focus:border-orange focus:ring-1 focus:ring-orange bg-white font-semibold text-navy"
                              >
                                {SERVICE_TYPES.map((type) => (
                                  <option key={type} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">
                                Payment Status
                              </label>
                              <select
                                value={paymentForm.payment_status}
                                onChange={(e) =>
                                  handlePaymentFieldChange("payment_status", e.target.value)
                                }
                                className="w-full px-3 py-2.5 border border-steel rounded-lg outline-none focus:border-orange focus:ring-1 focus:ring-orange bg-white font-bold text-navy uppercase"
                              >
                                {PAYMENT_STATUSES.map((p) => (
                                  <option key={p.value} value={p.value}>
                                    {p.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">
                                Total Booking Amount (₦)
                              </label>
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                required
                                value={paymentForm.total_amount}
                                onChange={(e) =>
                                  handlePaymentFieldChange("total_amount", e.target.value)
                                }
                                placeholder="e.g. 800000"
                                className="w-full px-3 py-2.5 border border-steel rounded-lg outline-none focus:border-orange focus:ring-1 focus:ring-orange font-mono font-bold text-navy"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">
                                Amount Paid (₦)
                              </label>
                              <input
                                type="number"
                                min="0"
                                max={paymentForm.total_amount || undefined}
                                step="0.01"
                                value={paymentForm.amount_paid}
                                onChange={(e) =>
                                  handlePaymentFieldChange("amount_paid", e.target.value)
                                }
                                placeholder="e.g. 700000"
                                className="w-full px-3 py-2.5 border border-steel rounded-lg outline-none focus:border-orange focus:ring-1 focus:ring-orange font-mono font-bold text-navy"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">
                                Payment Method
                              </label>
                              <select
                                value={paymentForm.payment_method}
                                onChange={(e) =>
                                  handlePaymentFieldChange("payment_method", e.target.value)
                                }
                                className="w-full px-3 py-2.5 border border-steel rounded-lg outline-none focus:border-orange focus:ring-1 focus:ring-orange bg-white"
                              >
                                <option value="cash">Cash</option>
                                <option value="pos">POS</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="online">Online Payment</option>
                                <option value="other">Other</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">
                                Payment Reference
                              </label>
                              <input
                                type="text"
                                value={paymentForm.payment_reference}
                                onChange={(e) =>
                                  handlePaymentFieldChange("payment_reference", e.target.value)
                                }
                                placeholder="Optional transaction ref"
                                className="w-full px-3 py-2.5 border border-steel rounded-lg outline-none focus:border-orange focus:ring-1 focus:ring-orange"
                              />
                            </div>
                          </div>

                          <div className="rounded-xl bg-slate-50 border border-steel p-4 grid grid-cols-3 gap-3 text-center">
                            <div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                Status
                              </p>
                              <p className="text-sm font-black text-navy uppercase mt-1">
                                {paymentForm.payment_status}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                Total Charge
                              </p>
                              <p className="text-sm font-black text-navy mt-1">
                                {formatNaira(paymentForm.total_amount)}
                              </p>
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-muted-foreground uppercase">
                                Balance
                              </p>
                              <p className="text-sm font-black text-orange mt-1">
                                {formatNaira(computedBalance)}
                              </p>
                            </div>
                          </div>
                        </>
                      )}

                      <button
                        type="submit"
                        disabled={savingPayment}
                        className="w-full py-3 bg-orange text-white rounded-lg font-bold uppercase tracking-wider hover:bg-orange-light transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <CheckCircle2 size={16} />
                        {savingPayment ? "Saving Payment..." : "Save Payment & Amount"}
                      </button>
                    </form>

                    {/* Receipt Preview & Print Card */}
                    <div className="bg-white rounded-xl border border-steel p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold">
                            Booking Receipt
                          </p>
                          <p className="font-mono font-bold text-navy mt-1">
                            {selectedShipment.receipt_number || selectedShipment.tracking_id}
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            {formatNaira(selectedShipment.amount_paid)} paid ·{" "}
                            {formatNaira(
                              Math.max(
                                Number(selectedShipment.total_amount) -
                                  Number(selectedShipment.amount_paid),
                                0
                              )
                            )}{" "}
                            balance
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${getPaymentStatusColor(
                            selectedShipment.payment_status
                          )}`}
                        >
                          {selectedShipment.payment_status || "unpaid"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePrintReceipt(selectedShipment)}
                        className="mt-4 w-full py-2.5 border border-navy text-navy rounded-lg font-bold hover:bg-navy hover:text-white transition-colors flex items-center justify-center gap-2"
                      >
                        <Printer size={16} /> Print Obech Logistics Receipt
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Status & Dispatch Tab */
                  <div className="space-y-6">
                    {/* Receipt quick card */}
                    <div className="bg-white rounded-xl border border-steel p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground uppercase font-semibold">
                            Booking Receipt & Payment
                          </p>
                          <p className="font-mono font-bold text-navy mt-1">
                            {selectedShipment.receipt_number || selectedShipment.tracking_id}
                          </p>
                          <p className="text-sm text-muted-foreground mt-2">
                            Total: {formatNaira(selectedShipment.total_amount)} ·{" "}
                            {formatNaira(selectedShipment.amount_paid)} paid ·{" "}
                            {formatNaira(
                              Math.max(
                                Number(selectedShipment.total_amount) -
                                  Number(selectedShipment.amount_paid),
                                0
                              )
                            )}{" "}
                            balance
                          </p>
                        </div>
                        <span
                          className={`px-2.5 py-1 rounded text-xs font-bold uppercase ${getPaymentStatusColor(
                            selectedShipment.payment_status
                          )}`}
                        >
                          {selectedShipment.payment_status || "unpaid"}
                        </span>
                      </div>
                      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setDrawerTab("payment")}
                          className="py-2.5 px-4 bg-slate-100 text-navy rounded-lg font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                        >
                          <CreditCard size={15} /> Edit Payment & Amount
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePrintReceipt(selectedShipment)}
                          className="py-2.5 px-4 border border-navy text-navy rounded-lg font-bold hover:bg-navy hover:text-white transition-colors flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                        >
                          <Printer size={15} /> Print Receipt
                        </button>
                      </div>
                    </div>

                    {/* Update Form */}
                    <div>
                      <h3 className="font-heading font-black text-navy uppercase tracking-wide mb-4">
                        Status & Dispatch
                      </h3>
                      <form
                        onSubmit={handleUpdate}
                        className="bg-white rounded-xl border border-steel p-5 space-y-5"
                      >
                        <div>
                          <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">
                            Service Type
                          </label>
                          <select
                            value={updateForm.delivery_type}
                            onChange={(e) =>
                              setUpdateForm({ ...updateForm, delivery_type: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-steel rounded-lg outline-none focus:border-orange focus:ring-1 focus:ring-orange font-semibold text-navy bg-white"
                          >
                            {SERVICE_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">
                            Assign Driver
                          </label>
                          <select
                            value={updateForm.driver_id}
                            onChange={(e) =>
                              setUpdateForm({ ...updateForm, driver_id: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-steel rounded-lg outline-none focus:border-orange focus:ring-1 focus:ring-orange bg-white"
                          >
                            <option value="">-- Unassigned --</option>
                            {drivers.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.full_name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">
                            Shipment Status
                          </label>
                          <select
                            value={updateForm.status}
                            onChange={(e) =>
                              setUpdateForm({ ...updateForm, status: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-steel rounded-lg outline-none focus:border-orange focus:ring-1 focus:ring-orange font-bold text-navy bg-white"
                          >
                            {STATUSES.map((s) => (
                              <option key={s.value} value={s.value}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">
                            Admin Note (Internal)
                          </label>
                          <textarea
                            value={updateForm.status_note}
                            onChange={(e) =>
                              setUpdateForm({ ...updateForm, status_note: e.target.value })
                            }
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
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <AdminOfficeBookingDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
        routes={routes}
        drivers={drivers}
        onCreated={fetchData}
      />
    </div>
  );
}
