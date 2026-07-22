import React, { useState } from "react";
import { Link } from "react-router-dom";
import { User, Mail, Phone, MapPin, Package, ArrowRight, CheckCircle2, ClipboardCopy, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { saveDirectBooking } from "@/utils/cmsStorage";

const COUNTRY_DIAL_CODES = [
  { code: "+234", name: "Nigeria" },
  { code: "+233", name: "Ghana" },
  { code: "+1", name: "USA / Canada" },
  { code: "+44", name: "United Kingdom" },
  { code: "+971", name: "UAE" },
  { code: "+86", name: "China" },
];

export default function BookShipment() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1); // 1: Sender & Receiver Info, 2: Item Info, 3: Success
  const [bookingCode, setBookingCode] = useState("");

  const [form, setForm] = useState({
    // Sender Information
    senderName: "",
    senderEmail: "",
    senderDialCode: "+234",
    senderPhone: "",
    senderAddress: "",

    // Receiver Information
    receiverName: "",
    receiverEmail: "",
    receiverDialCode: "+234",
    receiverPhone: "",
    receiverAddress: "",

    // Shipment details
    itemName: "",
    weight: "",
    packageType: "general",
    deliveryType: "standard",
  });

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    // Validate Step 1
    if (
      !form.senderName ||
      !form.senderEmail ||
      !form.senderPhone ||
      !form.senderAddress ||
      !form.receiverName ||
      !form.receiverEmail ||
      !form.receiverPhone ||
      !form.receiverAddress
    ) {
      toast({
        title: "Incomplete details",
        description: "Please fill in all Sender and Receiver information before proceeding.",
        variant: "destructive",
      });
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.itemName || !form.weight) {
      toast({
        title: "Missing items info",
        description: "Please specify the item name and estimated weight.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await saveDirectBooking(form);
      setBookingCode(res.tracking_id);
      setStep(3);
      toast({
        title: "Shipment Booked",
        description: "Your shipment booking request has been submitted successfully.",
      });
    } catch (err) {
      toast({
        title: "Booking Failed",
        description: err.message || "An error occurred while booking your shipment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyBookingCode = () => {
    navigator.clipboard.writeText(bookingCode);
    toast({
      title: "Copied to clipboard",
      description: "Booking code copied successfully.",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4">
      {/* Decorative background gradients */}
      <div className="absolute top-20 left-0 w-72 h-72 bg-orange/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-0 w-72 h-72 bg-navy/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto">
        {/* Step Indicator Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-black text-navy tracking-tight">
            Book a Shipment
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Schedule a parcel pickup and global door-to-door delivery.
          </p>

          {step < 3 && (
            <div className="flex items-center justify-center gap-4 mt-6">
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  step === 1 ? "bg-orange text-white" : "bg-steel text-navy"
                }`}
              >
                1. Addresses
              </span>
              <ChevronRight size={16} className="text-gray-400" />
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full ${
                  step === 2 ? "bg-orange text-white" : "bg-steel text-navy"
                }`}
              >
                2. Package details
              </span>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="bg-white rounded-2xl border border-steel shadow-sm p-6 sm:p-10 space-y-8"
            >
              <form onSubmit={handleNextStep} className="space-y-8">
                {/* SENDER INFORMATION */}
                <div className="space-y-4">
                  <h3 className="text-md font-heading font-extrabold text-navy uppercase tracking-wider border-b border-steel pb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-orange/15 text-orange flex items-center justify-center text-xs font-bold">1</span>
                    Sender's Information (Origin)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User size={16} className="absolute left-3 top-3.5 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={form.senderName}
                          onChange={(e) => updateField("senderName", e.target.value)}
                          placeholder="Your full name"
                          className="w-full border border-steel rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange text-navy"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-3.5 text-gray-400" />
                        <input
                          type="email"
                          required
                          value={form.senderEmail}
                          onChange={(e) => updateField("senderEmail", e.target.value)}
                          placeholder="your.email@gmail.com"
                          className="w-full border border-steel rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange text-navy"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                        Phone Number
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={form.senderDialCode}
                          onChange={(e) => updateField("senderDialCode", e.target.value)}
                          className="border border-steel rounded-lg px-2 text-sm bg-white focus:outline-none text-navy"
                        >
                          {COUNTRY_DIAL_CODES.map((item) => (
                            <option key={item.code} value={item.code}>
                              {item.code} ({item.name})
                            </option>
                          ))}
                        </select>
                        <div className="relative flex-1">
                          <Phone size={16} className="absolute left-3 top-3.5 text-gray-400" />
                          <input
                            type="tel"
                            required
                            value={form.senderPhone}
                            onChange={(e) => updateField("senderPhone", e.target.value)}
                            placeholder="Phone number"
                            className="w-full border border-steel rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange text-navy"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                        Home Address (Sender)
                      </label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-3.5 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={form.senderAddress}
                          onChange={(e) => updateField("senderAddress", e.target.value)}
                          placeholder="Home address, street, city"
                          className="w-full border border-steel rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange text-navy"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* RECEIVER INFORMATION */}
                <div className="space-y-4">
                  <h3 className="text-md font-heading font-extrabold text-navy uppercase tracking-wider border-b border-steel pb-2 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-orange/15 text-orange flex items-center justify-center text-xs font-bold">2</span>
                    Receiver's Information (Destination)
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <User size={16} className="absolute left-3 top-3.5 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={form.receiverName}
                          onChange={(e) => updateField("receiverName", e.target.value)}
                          placeholder="Receiver's full name"
                          className="w-full border border-steel rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange text-navy"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-3.5 text-gray-400" />
                        <input
                          type="email"
                          required
                          value={form.receiverEmail}
                          onChange={(e) => updateField("receiverEmail", e.target.value)}
                          placeholder="receiver.email@gmail.com"
                          className="w-full border border-steel rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange text-navy"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                        Phone Number
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={form.receiverDialCode}
                          onChange={(e) => updateField("receiverDialCode", e.target.value)}
                          className="border border-steel rounded-lg px-2 text-sm bg-white focus:outline-none text-navy"
                        >
                          {COUNTRY_DIAL_CODES.map((item) => (
                            <option key={item.code} value={item.code}>
                              {item.code} ({item.name})
                            </option>
                          ))}
                        </select>
                        <div className="relative flex-1">
                          <Phone size={16} className="absolute left-3 top-3.5 text-gray-400" />
                          <input
                            type="tel"
                            required
                            value={form.receiverPhone}
                            onChange={(e) => updateField("receiverPhone", e.target.value)}
                            placeholder="Phone number"
                            className="w-full border border-steel rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange text-navy"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                        Delivery Address (Receiver)
                      </label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-3 top-3.5 text-gray-400" />
                        <input
                          type="text"
                          required
                          value={form.receiverAddress}
                          onChange={(e) => updateField("receiverAddress", e.target.value)}
                          placeholder="Delivery address, street, city"
                          className="w-full border border-steel rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange text-navy"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    className="px-6 py-3.5 bg-orange text-white rounded-lg font-bold uppercase tracking-wider hover:bg-orange-light flex items-center gap-2 transition-all text-xs font-heading shadow-md shadow-orange/20"
                  >
                    Configure Package <ArrowRight size={16} />
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="bg-white rounded-2xl border border-steel shadow-sm p-6 sm:p-10"
            >
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="text-md font-heading font-extrabold text-navy uppercase tracking-wider border-b border-steel pb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-orange/15 text-orange flex items-center justify-center text-xs font-bold">3</span>
                  Package Specifics
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                      Name of Items
                    </label>
                    <div className="relative">
                      <Package size={16} className="absolute left-3 top-3.5 text-gray-400" />
                      <input
                        type="text"
                        required
                        value={form.itemName}
                        onChange={(e) => updateField("itemName", e.target.value)}
                        placeholder="e.g. Box of clothes, iPhone 15, Documents"
                        className="w-full border border-steel rounded-lg pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange text-navy"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                      Estimated Weight (kg)
                    </label>
                    <input
                      type="number"
                      required
                      min="0.1"
                      step="0.1"
                      value={form.weight}
                      onChange={(e) => updateField("weight", e.target.value)}
                      placeholder="e.g. 12.5"
                      className="w-full border border-steel rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange text-navy"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                      Package Category
                    </label>
                    <select
                      value={form.packageType}
                      onChange={(e) => updateField("packageType", e.target.value)}
                      className="w-full border border-steel rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange text-navy bg-white"
                    >
                      <option value="general">General Cargo / Parcel</option>
                      <option value="electronics">Electronics / Gadgets</option>
                      <option value="documents">Official Documents</option>
                      <option value="fragile">Fragile items</option>
                      <option value="perishable">Perishables</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-2">
                      Delivery Mode
                    </label>
                    <select
                      value={form.deliveryType}
                      onChange={(e) => updateField("deliveryType", e.target.value)}
                      className="w-full border border-steel rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange text-navy bg-white"
                    >
                      <option value="standard">Standard Global Delivery (5-8 days)</option>
                      <option value="express">Express Priority Air Freight (2-4 days)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-steel mt-8">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-3.5 border border-steel text-navy rounded-lg font-semibold hover:bg-slate-50 transition-all text-xs font-heading"
                  >
                    Back to Addresses
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3.5 bg-orange text-white rounded-lg font-bold uppercase tracking-wider hover:bg-orange-light flex items-center gap-2 disabled:opacity-50 transition-all text-xs font-heading shadow-md shadow-orange/20"
                  >
                    {loading ? "Registering Shipment..." : "Book Shipment Now"}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-steel shadow-sm p-8 text-center space-y-6"
            >
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={36} />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-heading font-black text-navy">
                  Shipment Booked Successfully!
                </h2>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Your shipment request has been saved in our dispatch pipeline. An email notification with the booking invoice has been sent to you.
                </p>
              </div>

              <div className="bg-slate-50 border border-steel rounded-xl p-6 max-w-sm mx-auto space-y-3">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest block">
                  Your Booking Reference
                </span>
                <div className="flex items-center justify-center gap-3">
                  <code className="text-lg font-heading font-black text-navy font-mono tracking-wider">
                    {bookingCode}
                  </code>
                  <button
                    onClick={copyBookingCode}
                    className="p-2 text-gray-400 hover:text-orange hover:bg-white rounded-lg border border-transparent hover:border-steel transition-all"
                    title="Copy code"
                  >
                    <ClipboardCopy size={16} />
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Link
                  to={`/track?id=${bookingCode}`}
                  className="w-full sm:w-auto px-6 py-3.5 bg-orange text-white rounded-lg font-bold uppercase tracking-wider hover:bg-orange-light text-xs font-heading shadow-md"
                >
                  Track Live Shipment
                </Link>

                <Link
                  to="/"
                  className="w-full sm:w-auto px-6 py-3.5 border border-steel text-navy rounded-lg font-semibold hover:bg-slate-50 text-xs font-heading"
                >
                  Return to Home
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
