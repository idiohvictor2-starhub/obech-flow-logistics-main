import React, { useState, useEffect } from "react";
import { Search, Package, MapPin, Truck, FileCheck, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

const STEPS = [
  { key: "pending", label: "Pending", icon: Package },
  { key: "confirmed", label: "Confirmed", icon: FileCheck },
  { key: "picked_up", label: "Picked Up", icon: MapPin },
  { key: "in_transit", label: "In Transit", icon: Truck },
  { key: "out_for_delivery", label: "Out for Delivery", icon: Truck },
  { key: "delivered", label: "Delivered", icon: CheckCircle2 },
];

function getStepIndex(status) {
  const idx = STEPS.findIndex((s) => s.key === status);
  return idx === -1 && status === "failed" ? STEPS.length : idx; // "failed" is a special case
}

export default function Tracking() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shipment, setShipment] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tn = params.get("id"); // Using 'id' as specified in the requirements
    if (tn) {
      setTrackingNumber(tn);
      searchShipment(tn);
    }
  }, []);

  useEffect(() => {
    let channel;
    if (shipment?.tracking_id) {
      channel = supabase
        .channel(`shipment-${shipment.tracking_id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'shipments',
            filter: `tracking_id=eq.${shipment.tracking_id}`,
          },
          (payload) => {
            setShipment(payload.new);
            fetchHistory(payload.new.id);
          }
        )
        .subscribe((status) => {
          setIsLive(status === 'SUBSCRIBED');
        });
    }

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [shipment?.tracking_id]);

  const fetchHistory = async (shipmentId) => {
    const { data } = await supabase
      .from('status_history')
      .select('*')
      .eq('shipment_id', shipmentId)
      .order('created_at', { ascending: false });
    
    if (data) {
      setHistory(data);
    }
  };

  const searchShipment = async (tn) => {
    setLoading(true);
    setSearched(true);
    setShipment(null);
    setHistory([]);
    setIsLive(false);

    try {
      // Fetch shipment and join driver and route
      const { data, error } = await supabase
        .from("shipments")
        .select(`
          *,
          drivers ( full_name, phone ),
          routes ( route_name, origin, destination )
        `)
        .eq("tracking_id", tn.trim())
        .single();

      if (data) {
        setShipment(data);
        await fetchHistory(data.id);
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
      window.history.pushState({}, '', `/track?id=${trackingNumber.trim()}`);
      searchShipment(trackingNumber);
    }
  };

  const currentStep = shipment ? getStepIndex(shipment.status) : -1;
  const isFailed = shipment?.status === "failed";

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
            Enter your tracking ID to get real-time updates on your shipment status.
          </p>

          {/* Tracking Input */}
          <form onSubmit={handleSubmit} className="mt-10 max-w-2xl">
            <div className="flex items-center bg-white/10 backdrop-blur-xl border border-white/15 rounded-xl p-2">
              <div className="flex items-center gap-3 flex-1 px-4">
                <Search size={18} className="text-orange shrink-0" />
                <input
                  type="text"
                  placeholder="Enter tracking ID (e.g., OBL-2024-XXXXXX)"
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
              className="text-center py-16 bg-white rounded-2xl border border-steel shadow-sm max-w-2xl mx-auto"
            >
              <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-heading font-bold text-navy">No shipment found for this ID.</h3>
              <p className="text-muted-foreground mt-2">
                Please check the tracking ID and try again.
              </p>
            </motion.div>
          )}

          {!loading && shipment && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-3xl mx-auto"
            >
              {/* Shipment Info Card */}
              <div className="bg-white rounded-2xl border border-steel overflow-hidden shadow-sm relative">
                
                {isLive && (
                  <div className="absolute top-4 right-4 flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 z-10">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">Live</span>
                  </div>
                )}

                <div className="bg-navy p-6 pt-10 sm:pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-mono text-orange uppercase tracking-widest">Tracking ID</p>
                    <p className="text-white font-mono font-bold text-xl mt-1">{shipment.tracking_id}</p>
                  </div>
                  
                  {/* Status Badge */}
                  <div className={`px-4 py-2 border rounded text-xs font-bold uppercase tracking-wider ${
                    isFailed ? "bg-red-500/10 border-red-500/30 text-red-500" :
                    shipment.status === "delivered" ? "bg-green-500/10 border-green-500/30 text-green-500" :
                    shipment.status === "out_for_delivery" ? "bg-amber-500/10 border-amber-500/30 text-amber-500 animate-pulse" :
                    shipment.status === "in_transit" ? "bg-blue-600/10 border-blue-600/30 text-blue-600" :
                    shipment.status === "picked_up" ? "bg-amber-400/10 border-amber-400/30 text-amber-600" :
                    shipment.status === "confirmed" ? "bg-blue-400/10 border-blue-400/30 text-blue-500" :
                    "bg-gray-500/10 border-gray-500/30 text-gray-500"
                  }`}>
                    {STEPS.find(s => s.key === shipment.status)?.label || shipment.status.replace("_", " ")}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y divide-steel bg-slate-50/50">
                  <div className="p-4 md:col-span-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">Route</p>
                    <p className="text-sm font-semibold text-navy truncate" title={`${shipment.routes?.origin} to ${shipment.routes?.destination}`}>
                      {shipment.routes ? `${shipment.routes.origin} → ${shipment.routes.destination}` : "—"}
                    </p>
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">Client Name</p>
                    <p className="text-sm font-semibold text-navy truncate" title={shipment.client_name}>{shipment.client_name}</p>
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">Package</p>
                    <p className="text-sm font-semibold text-navy capitalize">{shipment.package_type || "—"}</p>
                  </div>
                  <div className="p-4 md:col-span-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">Assigned Driver</p>
                    <p className="text-sm font-semibold text-navy">
                      {shipment.drivers ? `${shipment.drivers.full_name} (${shipment.drivers.phone})` : "Unassigned"}
                    </p>
                  </div>
                  <div className="p-4 md:col-span-2">
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold mb-1">Est. Delivery</p>
                    <p className="text-sm font-semibold text-navy">
                      {shipment.estimated_delivery ? new Date(shipment.estimated_delivery).toLocaleDateString() : "—"}
                    </p>
                  </div>
                </div>

                {/* Timeline */}
                <div className="p-6 lg:p-8 border-t border-steel">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-navy mb-6">
                    Progress Timeline
                  </h3>
                  
                  {isFailed ? (
                    <div className="bg-red-50 border border-red-100 p-4 rounded-lg flex items-start gap-3">
                      <AlertCircle className="text-red-500 shrink-0" />
                      <div>
                        <h4 className="font-bold text-red-800">Delivery Failed</h4>
                        <p className="text-sm text-red-600 mt-1">There was an issue delivering this shipment. Please contact support.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Mobile Vertical, Desktop Horizontal layout for timeline can be complex, sticking to responsive vertical for robust UI as per requirements standard */}
                      {STEPS.map((step, i) => {
                        const isCompleted = i <= currentStep;
                        const isCurrent = i === currentStep;
                        
                        return (
                          <div key={step.key} className="flex items-start gap-4 relative">
                            {/* Vertical line connecting dots */}
                            {i < STEPS.length - 1 && (
                              <div className={`absolute left-[19px] top-10 w-[2px] h-10 ${i < currentStep ? "bg-green-500" : "bg-steel"}`} />
                            )}
                            
                            {/* Dot */}
                            <div className="relative z-10 shrink-0 pb-8">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${
                                isCompleted ? "bg-green-500" : "bg-steel"
                              }`}>
                                <step.icon size={18} className={isCompleted ? "text-white" : "text-muted-foreground"} />
                              </div>
                              {isCurrent && shipment.status !== "delivered" && (
                                <div className="absolute top-0 left-0 w-10 h-10 rounded-full border-2 border-orange animate-ping opacity-50" />
                              )}
                            </div>
                            
                            {/* Label */}
                            <div className="pt-2 pb-8">
                              <p className={`text-sm font-bold ${isCompleted ? "text-navy" : "text-muted-foreground"}`}>
                                {step.label}
                              </p>
                              {isCurrent && shipment.status !== "delivered" && (
                                <p className="text-xs text-orange font-bold uppercase tracking-wider mt-1 flex items-center gap-1">
                                  <Clock size={12} /> Current Status
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Status History Accordion */}
                {history.length > 0 && (
                  <div className="border-t border-steel bg-slate-50">
                    <details className="group">
                      <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-bold text-navy text-sm uppercase tracking-wider">
                        <span>View Status History ({history.length})</span>
                        <span className="transition group-open:rotate-180">
                          <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                        </span>
                      </summary>
                      <div className="px-6 pb-6 text-sm text-muted-foreground">
                        <div className="space-y-4">
                          {history.map((hist) => (
                            <div key={hist.id} className="flex gap-4 p-3 rounded-lg bg-white border border-steel/50">
                              <div className="shrink-0 w-10 h-10 rounded-full bg-navy/5 flex items-center justify-center">
                                <Clock size={16} className="text-navy" />
                              </div>
                              <div>
                                <p className="font-bold text-navy capitalize">{hist.status.replace("_", " ")}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">{new Date(hist.created_at).toLocaleString()}</p>
                                {hist.note && (
                                  <p className="mt-2 text-sm text-slate-600 bg-slate-50 p-2 rounded border border-slate-100">{hist.note}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </details>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {!searched && !loading && (
            <div className="text-center py-16">
              <Package size={48} className="text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">Enter a tracking ID above to view shipment status.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}