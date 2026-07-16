import React, { useMemo, useState } from "react";
import { CheckCircle2, Loader2, Plus, Printer } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { formatNaira, printBookingReceipt } from "@/utils/printBookingReceipt";

const createInitialForm = () => ({
  client_name: "",
  client_email: "",
  client_phone: "",
  sender_address: "",
  receiver_name: "",
  receiver_phone: "",
  receiver_address: "",
  package_type: "",
  weight_kg: "",
  declared_value: "",
  delivery_type: "bike",
  route_id: "",
  driver_id: "",
  estimated_delivery: "",
  status: "confirmed",
  status_note: "Office walk-in booking",
  total_amount: "",
  amount_paid: "0",
  payment_method: "cash",
  payment_reference: "",
});

const generateReference = (prefix) => {
  const year = new Date().getFullYear();
  const timePart = Date.now().toString().slice(-6);
  const randomPart = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${year}-${timePart}${randomPart}`;
};

export default function AdminOfficeBookingDialog({
  open,
  onOpenChange,
  routes,
  drivers,
  onCreated,
}) {
  const { toast } = useToast();
  const [form, setForm] = useState(createInitialForm);
  const [submitting, setSubmitting] = useState(false);
  const [createdShipment, setCreatedShipment] = useState(null);

  const totalAmount = Number(form.total_amount) || 0;
  const amountPaid = Number(form.amount_paid) || 0;
  const balance = Math.max(totalAmount - amountPaid, 0);
  const paymentStatus = useMemo(() => {
    if (amountPaid <= 0) return "unpaid";
    if (amountPaid < totalAmount) return "partial";
    return "paid";
  }, [amountPaid, totalAmount]);

  const set = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const reset = () => {
    setForm(createInitialForm());
    setCreatedShipment(null);
    setSubmitting(false);
  };

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (
      !form.client_name ||
      !form.client_phone ||
      !form.sender_address ||
      !form.receiver_name ||
      !form.receiver_address ||
      !form.package_type ||
      !form.delivery_type ||
      !form.total_amount
    ) {
      toast({
        title: "Complete required fields",
        description: "Customer, delivery, package, vehicle, and charge details are required.",
        variant: "destructive",
      });
      return;
    }

    if (totalAmount < 0 || amountPaid < 0 || amountPaid > totalAmount) {
      toast({
        title: "Check payment amounts",
        description: "Amount paid cannot be negative or greater than the total charge.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Your admin session has expired. Please sign in again.");
      }

      const trackingId = generateReference("OBL");
      const receiptNumber = generateReference("OBR");

      const { data, error } = await supabase
        .from("shipments")
        .insert({
          tracking_id: trackingId,
          client_name: form.client_name.trim(),
          client_email: form.client_email.trim() || null,
          client_phone: form.client_phone.trim(),
          sender_address: form.sender_address.trim(),
          receiver_name: form.receiver_name.trim(),
          receiver_phone: form.receiver_phone.trim() || null,
          receiver_address: form.receiver_address.trim(),
          package_type: form.package_type.trim(),
          weight_kg: form.weight_kg ? Number(form.weight_kg) : null,
          declared_value: form.declared_value ? Number(form.declared_value) : null,
          delivery_type: form.delivery_type,
          route_id: form.route_id || null,
          driver_id: form.driver_id || null,
          estimated_delivery: form.estimated_delivery || null,
          status: form.status,
          status_note: form.status_note.trim() || "Office walk-in booking",
          booking_source: "office",
          receipt_number: receiptNumber,
          total_amount: totalAmount,
          amount_paid: amountPaid,
          payment_status: paymentStatus,
          payment_method: amountPaid > 0 ? form.payment_method : null,
          payment_reference: form.payment_reference.trim() || null,
          created_by: user.email || user.id,
        })
        .select(`
          *,
          routes ( route_name, origin, destination ),
          drivers ( full_name, phone )
        `)
        .single();

      if (error) throw error;

      const { error: historyError } = await supabase
        .from("status_history")
        .insert({
          shipment_id: data.id,
          status: data.status,
          note: `Office booking created. Receipt ${receiptNumber}.`,
          updated_by: user.email || "Office Admin",
        });

      if (historyError) {
        console.error("Office booking history error:", historyError);
      }

      setCreatedShipment(data);
      onCreated(data);
      toast({
        title: "Office booking created",
        description: `${trackingId} is ready and the receipt can now be printed.`,
      });
    } catch (error) {
      const needsMigration =
        error.message?.includes("booking_source") ||
        error.message?.includes("receipt_number") ||
        error.message?.includes("schema cache");

      toast({
        title: "Booking could not be created",
        description: needsMigration
          ? "Apply the admin office-booking SQL migration in Supabase, then try again."
          : error.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrint = () => {
    if (!printBookingReceipt(createdShipment)) {
      toast({
        title: "Print window blocked",
        description: "Allow pop-ups for this site, then select Print Receipt again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-5xl max-h-[92vh] overflow-y-auto p-0 gap-0">
        <DialogHeader className="bg-navy text-white p-6 pr-14">
          <DialogTitle className="text-xl font-heading font-black text-white">
            {createdShipment ? "Office Booking Complete" : "Create Office Booking"}
          </DialogTitle>
          <DialogDescription className="text-white/60">
            {createdShipment
              ? "Review the booking details and print the customer receipt."
              : "Register a walk-in customer, record payment, and generate a printable receipt."}
          </DialogDescription>
        </DialogHeader>

        {createdShipment ? (
          <div className="p-6 lg:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                <CheckCircle2 size={34} />
              </div>
              <h3 className="mt-4 text-xl font-heading font-black text-navy">Booking Saved Successfully</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                The booking is now listed under Master Shipments.
              </p>
            </div>

            <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Summary label="Tracking ID" value={createdShipment.tracking_id} mono />
              <Summary label="Receipt Number" value={createdShipment.receipt_number} mono />
              <Summary label="Total Charge" value={formatNaira(createdShipment.total_amount)} />
              <Summary label="Balance" value={formatNaira(Number(createdShipment.total_amount) - Number(createdShipment.amount_paid))} />
            </div>

            <div className="mt-6 rounded-xl border border-steel bg-slate-50 p-5 grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
              <Summary label="Customer" value={`${createdShipment.client_name} · ${createdShipment.client_phone}`} />
              <Summary label="Payment" value={`${createdShipment.payment_status.toUpperCase()}${createdShipment.payment_method ? ` · ${createdShipment.payment_method}` : ""}`} />
              <Summary label="Pickup" value={createdShipment.sender_address} />
              <Summary label="Delivery" value={createdShipment.receiver_address} />
            </div>

            <div className="mt-8 flex flex-col-reverse sm:flex-row justify-end gap-3">
              <button
                type="button"
                onClick={() => reset()}
                className="px-5 py-3 rounded-lg border border-steel bg-white text-navy font-bold hover:bg-slate-50"
              >
                <Plus size={17} className="inline mr-2" />
                Create Another
              </button>
              <button
                type="button"
                onClick={handlePrint}
                className="px-5 py-3 rounded-lg bg-orange text-white font-bold hover:bg-orange-light"
              >
                <Printer size={17} className="inline mr-2" />
                Print Receipt
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 lg:p-8 space-y-8">
            <FormSection title="Customer Details">
              <Field label="Customer Name *" value={form.client_name} onChange={set("client_name")} />
              <Field label="Phone Number *" value={form.client_phone} onChange={set("client_phone")} />
              <Field label="Email Address" type="email" value={form.client_email} onChange={set("client_email")} />
            </FormSection>

            <FormSection title="Pickup and Delivery">
              <TextArea label="Pickup Address *" value={form.sender_address} onChange={set("sender_address")} />
              <Field label="Recipient Name *" value={form.receiver_name} onChange={set("receiver_name")} />
              <Field label="Recipient Phone" value={form.receiver_phone} onChange={set("receiver_phone")} />
              <TextArea label="Delivery Address *" value={form.receiver_address} onChange={set("receiver_address")} />
              <Select label="Configured Route" value={form.route_id} onChange={set("route_id")}>
                <option value="">No configured route</option>
                {routes.map((route) => (
                  <option key={route.id} value={route.id}>
                    {route.route_name} — {route.origin} to {route.destination}
                  </option>
                ))}
              </Select>
              <Field label="Estimated Delivery" type="date" value={form.estimated_delivery} onChange={set("estimated_delivery")} />
            </FormSection>

            <FormSection title="Package and Dispatch">
              <Field label="Package Description *" value={form.package_type} onChange={set("package_type")} placeholder="Documents, electronics, cartons..." />
              <Field label="Weight (kg)" type="number" min="0" step="0.01" value={form.weight_kg} onChange={set("weight_kg")} />
              <Field label="Declared Value (₦)" type="number" min="0" step="0.01" value={form.declared_value} onChange={set("declared_value")} />
              <Select label="Vehicle Type *" value={form.delivery_type} onChange={set("delivery_type")}>
                <option value="bike">Bike Dispatch</option>
                <option value="van">Van Pickup</option>
                <option value="truck">Truck Logistics</option>
              </Select>
              <Select label="Assign Driver" value={form.driver_id} onChange={set("driver_id")}>
                <option value="">Assign later</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>{driver.full_name}</option>
                ))}
              </Select>
              <Select label="Initial Status" value={form.status} onChange={set("status")}>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
              </Select>
            </FormSection>

            <FormSection title="Charge and Payment">
              <Field label="Total Charge (₦) *" type="number" min="0" step="0.01" value={form.total_amount} onChange={set("total_amount")} />
              <Field label="Amount Paid (₦)" type="number" min="0" max={form.total_amount || undefined} step="0.01" value={form.amount_paid} onChange={set("amount_paid")} />
              <Select label="Payment Method" value={form.payment_method} onChange={set("payment_method")} disabled={amountPaid <= 0}>
                <option value="cash">Cash</option>
                <option value="pos">POS</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="online">Online Payment</option>
                <option value="other">Other</option>
              </Select>
              <Field label="Payment Reference" value={form.payment_reference} onChange={set("payment_reference")} disabled={amountPaid <= 0} />
            </FormSection>

            <div className="rounded-xl bg-slate-50 border border-steel p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Summary label="Payment Status" value={paymentStatus.toUpperCase()} />
              <Summary label="Total" value={formatNaira(totalAmount)} />
              <Summary label="Balance" value={formatNaira(balance)} />
            </div>

            <div>
              <TextArea label="Internal Note" value={form.status_note} onChange={set("status_note")} />
            </div>

            <div className="flex justify-end gap-3 border-t border-steel pt-6">
              <button
                type="button"
                onClick={() => handleOpenChange(false)}
                className="px-5 py-3 rounded-lg border border-steel bg-white text-navy font-bold hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-3 rounded-lg bg-orange text-white font-bold hover:bg-orange-light disabled:opacity-50 flex items-center gap-2"
              >
                {submitting ? <Loader2 size={17} className="animate-spin" /> : <Plus size={17} />}
                {submitting ? "Creating..." : "Create Booking"}
              </button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function FormSection({ title, children }) {
  return (
    <section>
      <h3 className="text-sm font-heading font-black text-navy uppercase tracking-wide mb-4">{title}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{children}</div>
    </section>
  );
}

function Field({ label, ...props }) {
  return (
    <label className="block text-sm">
      <span className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">{label}</span>
      <input
        {...props}
        className="w-full px-3 py-2.5 border border-steel rounded-lg outline-none focus:border-orange focus:ring-1 focus:ring-orange disabled:bg-slate-100 disabled:text-muted-foreground"
      />
    </label>
  );
}

function Select({ label, children, ...props }) {
  return (
    <label className="block text-sm">
      <span className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">{label}</span>
      <select
        {...props}
        className="w-full px-3 py-2.5 border border-steel rounded-lg outline-none focus:border-orange focus:ring-1 focus:ring-orange bg-white disabled:bg-slate-100 disabled:text-muted-foreground"
      >
        {children}
      </select>
    </label>
  );
}

function TextArea({ label, ...props }) {
  return (
    <label className="block text-sm">
      <span className="block text-xs font-semibold text-navy uppercase tracking-wider mb-2">{label}</span>
      <textarea
        {...props}
        rows={3}
        className="w-full px-3 py-2.5 border border-steel rounded-lg outline-none focus:border-orange focus:ring-1 focus:ring-orange resize-none"
      />
    </label>
  );
}

function Summary({ label, value, mono = false }) {
  return (
    <div>
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`mt-1 text-sm font-bold text-navy break-words ${mono ? "font-mono" : ""}`}>{value || "—"}</p>
    </div>
  );
}
