import React, { useState, useEffect } from "react";
import { Search, Package, MapPin, Truck, FileCheck, CheckCircle2, Clock, AlertCircle } from "lucide-react"; "lucide-react";
import { motion } from "framer-motion";

const STEPS = [
  { key: "booking_confirmed", label: "Booking Confirmed", icon: Package },
  { key: "cargo_picked_up", label: "Cargo Picked Up", icon: MapPin },
  { key: "in_transit", label: "In Transit", icon: Truck },
  { key: "customs_clearance", label: "Customs Clearance", icon: FileCheck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

function getStepIndex(status) {
  return STEPS.findIndex((s) => s.key === status);
}

export default function Tracking() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tn = params.get("tn");
    if (tn) {
      setTrackingNumber(tn);
      searchShipment(tn);
    }
  }, []);

  const searchShipment = async (tn) => {
  setLoading(true);
  setSearched(true);
  setShipment(null);

  try {
    const shipments = JSON.parse(
      localStorage.getItem("obech_shipments") || "[]"
    );

    const found = shipments.find(
      (item) =>
        item.tracking_number?.toLowerCase() === tn.trim().toLowerCase()
    );

    if (found) {
      setShipment(found);
    }
  } catch (e) {
    console.error("Tracking search failed:", e);
  } finally {
    setLoading(false);
  }
};

  const handleSubmit = (e) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      searchShipment(trackingNumber);
    }
  };

  const currentStep = shipment ? getStepIndex(shipment.status) : -1;

  return (
    <>
      {/* Hero */}
      <section className="bg-navy pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange">
            Shipment Tracking
          </span>
          <h1 className="text-4xl lg:text-5xl font-heading font-black text-white mt-3">
            Track Your Shipment
          </h1>
          <p className="text-white/60 max-w-xl mt-4 leading-relaxed">
            Enter your tracking number to get real-time updates on your shipment status.
          </p>

          {/* Tracking Input */}
          <form onSubmit={handleSubmit} className="mt-10 max-w-2xl">
            <div className="flex items-center bg-white/10 backdrop-blur-xl border border-white/15 rounded-xl p-2">
              <div className="flex items-center gap-3 flex-1 px-4">
                <Search size={18} className="text-orange shrink-0" />
                <input
                  type="text"
                  placeholder="Enter tracking number (e.g., OBL-2026-001)"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder:text-white/40 text-sm py-3 outline-none font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-orange text-white text-sm font-semibold uppercase tracking-wider rounded-lg hover:bg-orange-light transition-all whitespace-nowrap disabled:opacity-50"
              >
                {loading ? "Searching..." : "Track Now"}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Results */}
      <section className="py-16 bg-steel min-h-[40vh]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10">
          {loading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-steel border-t-orange rounded-full animate-spin" />
            </div>
          )}

          {!loading && searched && !shipment && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <AlertCircle size={48} className="text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-heading font-bold text-navy">Shipment Not Found</h3>
              <p className="text-muted-foreground mt-2">
                We couldn't find a shipment with that tracking number. Please check and try again.
              </p>
            </motion.div>
          )}

          {!loading && shipment && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {/* Shipment Info Card */}
              <div className="bg-white rounded-2xl border border-steel overflow-hidden">
                <div className="bg-navy p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-mono text-orange uppercase tracking-widest">Tracking Number</p>
                    <p className="text-white font-mono font-bold text-lg mt-1">{shipment.tracking_number}</p>
                  </div>
                  <div className="px-4 py-2 bg-orange/10 border border-orange/30 rounded text-orange text-xs font-semibold uppercase tracking-wider">
                    {STEPS[currentStep]?.label || shipment.status}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y divide-steel">
                  <div className="p-5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Origin</p>
                    <p className="font-heading font-semibold text-navy mt-1">{shipment.origin}</p>
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Destination</p>
                    <p className="font-heading font-semibold text-navy mt-1">{shipment.destination}</p>
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Service</p>
                    <p className="font-heading font-semibold text-navy mt-1">{shipment.service_type || "—"}</p>
                  </div>
                  <div className="p-5">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Est. Delivery</p>
                    <p className="font-heading font-semibold text-navy mt-1">{shipment.estimated_delivery || "—"}</p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="p-6 lg:p-10">
                  <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-8">
                    Shipment Progress
                  </h3>
                  <div className="relative">
                    {STEPS.map((step, i) => {
                      const isCompleted = i <= currentStep;
                      const isCurrent = i === currentStep;
                      return (
                        <div key={step.key} className="flex items-start gap-5 relative">
                          {/* Vertical line */}
                          {i < STEPS.length - 1 && (
                            <div className={`absolute left-5 top-10 w-0.5 h-12 ${i < currentStep ? "bg-orange" : "bg-steel"}`} />
                          )}
                          {/* Dot */}
                          <div className="relative z-10 shrink-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isCompleted ? "bg-orange" : "bg-steel"
                            }`}>
                              <step.icon size={18} className={isCompleted ? "text-white" : "text-muted-foreground"} />
                            </div>
                            {isCurrent && (
                              <div className="absolute inset-0 rounded-full border-2 border-orange animate-pulse-ring" />
                            )}
                          </div>
                          {/* Label */}
                          <div className="pb-12">
                            <p className={`font-heading font-semibold ${isCompleted ? "text-navy" : "text-muted-foreground"}`}>
                              {step.label}
                            </p>
                            {isCurrent && (
                              <p className="text-xs text-orange font-mono mt-1 flex items-center gap-1">
                                <Clock size={12} /> Current Status
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {!searched && !loading && (
            <div className="text-center py-16">
              <Package size={48} className="text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Enter a tracking number above to view shipment status.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}