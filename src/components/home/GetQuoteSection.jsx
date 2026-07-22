import React, { useState, useEffect } from "react";
import { Send, MessageCircle, CheckCircle2, Loader2, Plane, Ship, PackageCheck, ShieldCheck, ClipboardCopy, ArrowRight, User, Mail, Phone, MapPin } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { saveQuoteRequest, saveDirectBooking, getCmsData } from "@/utils/cmsStorage";
import CountrySelect from "@/components/ui/CountrySelect";
import PhoneInput from "@/components/ui/PhoneInput";

const FREIGHT_TYPES = [
  { value: "Air Express", label: "Air Express", icon: Plane },
  { value: "Air Cargo", label: "Air Cargo", icon: Plane },
  { value: "Sea Freight", label: "Sea Freight", icon: Ship },
];

const INITIAL_QUOTE_FORM = {
  fullName: "",
  email: "",
  dialCode: "+234",
  phone: "",
  freightType: "Air Express",
  originCountry: "Nigeria",
  originCountryCode: "NG",
  destinationCountry: "United States",
  destinationCountryCode: "US",
  cargoDescription: "",
  estimatedWeight: "",
  lengthCm: "",
  widthCm: "",
  heightCm: "",
  additionalMessage: "",
  insuranceRequested: false,
  dangerousGoods: false,
};

const INITIAL_BOOKING_FORM = {
  senderName: "",
  senderEmail: "",
  senderDialCode: "+234",
  senderPhone: "",
  senderAddress: "",

  receiverName: "",
  receiverEmail: "",
  receiverDialCode: "+234",
  receiverPhone: "",
  receiverAddress: "",

  itemName: "",
  weight: "",
  packageType: "general",
  deliveryType: "standard",
};

export default function GetQuoteSection() {
  const { toast } = useToast();
  const [activeForm, setActiveForm] = useState("quote"); // "quote" | "booking"
  const [quoteForm, setQuoteForm] = useState(INITIAL_QUOTE_FORM);
  const [bookingForm, setBookingForm] = useState(INITIAL_BOOKING_FORM);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const [errors, setErrors] = useState({});
  const [whatsappNumber, setWhatsappNumber] = useState("+2349066755440");

  useEffect(() => {
    const cms = getCmsData();
    if (cms?.settings?.whatsappNumber) {
      setWhatsappNumber(cms.settings.whatsappNumber);
    }
  }, []);

  // Compute volumetric weight for Quote: (L x W x H) / 5000
  const length = parseFloat(quoteForm.lengthCm) || 0;
  const width = parseFloat(quoteForm.widthCm) || 0;
  const height = parseFloat(quoteForm.heightCm) || 0;
  const volumetricWeight = (length > 0 && width > 0 && height > 0)
    ? ((length * width * height) / 5000).toFixed(2)
    : null;

  const validateQuote = () => {
    const newErrors = {};
    if (!quoteForm.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!quoteForm.email.trim()) newErrors.email = "Email Address is required";
    if (!quoteForm.phone.trim()) newErrors.phone = "Phone Number is required";
    if (!quoteForm.originCountry) newErrors.originCountry = "Origin Country is mandatory";
    if (!quoteForm.destinationCountry) newErrors.destinationCountry = "Destination Country is mandatory";
    if (!quoteForm.estimatedWeight || parseFloat(quoteForm.estimatedWeight) <= 0) {
      newErrors.estimatedWeight = "Weight in kg is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateBooking = () => {
    const newErrors = {};
    if (!bookingForm.senderName.trim()) newErrors.senderName = "Sender name is required";
    if (!bookingForm.senderEmail.trim()) newErrors.senderEmail = "Sender email is required";
    if (!bookingForm.senderPhone.trim()) newErrors.senderPhone = "Sender phone is required";
    if (!bookingForm.senderAddress.trim()) newErrors.senderAddress = "Sender address is required";
    if (!bookingForm.receiverName.trim()) newErrors.receiverName = "Receiver name is required";
    if (!bookingForm.receiverEmail.trim()) newErrors.receiverEmail = "Receiver email is required";
    if (!bookingForm.receiverPhone.trim()) newErrors.receiverPhone = "Receiver phone is required";
    if (!bookingForm.receiverAddress.trim()) newErrors.receiverAddress = "Receiver delivery address is required";
    if (!bookingForm.itemName.trim()) newErrors.itemName = "Item name is required";
    if (!bookingForm.weight || parseFloat(bookingForm.weight) <= 0) {
      newErrors.weight = "Item weight is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    if (!validateQuote()) {
      toast({
        title: "Incomplete Quote Request",
        description: "Please check all required fields and try again.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const dimensions = (length > 0 && width > 0 && height > 0)
        ? `${length}x${width}x${height} cm`
        : "";

      const result = await saveQuoteRequest({
        ...quoteForm,
        dimensions,
        volumetricWeight,
      });

      setTrackingId(result.tracking_id);
      setSubmitted(true);
      toast({
        title: "Quote Submitted Successfully!",
        description: `Reference #${result.tracking_id} is generated.`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Quote Submission Failed",
        description: err.message || "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    if (!validateBooking()) {
      toast({
        title: "Incomplete Booking Details",
        description: "Please fill in all Sender, Receiver, and Item fields.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await saveDirectBooking(bookingForm);
      setTrackingId(result.tracking_id);
      setSubmitted(true);
      toast({
        title: "Shipment Booked Successfully!",
        description: `Booking Reference #${result.tracking_id} is generated.`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Booking Failed",
        description: err.message || "Could not book shipment.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(trackingId);
    toast({
      title: "Copied Reference",
      description: "Reference code copied to clipboard.",
    });
  };

  const openWhatsApp = () => {
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, "");
    let text = "";
    if (activeForm === "quote") {
      text = `Hello Obech Global Logistics! I want a rate quotation for ${quoteForm.freightType}.\nOrigin: ${quoteForm.originCountry}\nDestination: ${quoteForm.destinationCountry}\nWeight: ${quoteForm.estimatedWeight} kg\nName: ${quoteForm.fullName}`;
    } else {
      text = `Hello Obech Global Logistics! I want to book a shipment for ${bookingForm.itemName}.\nSender: ${bookingForm.senderName}\nReceiver: ${bookingForm.receiverName}\nWeight: ${bookingForm.weight} kg`;
    }
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <section id="quote-section" className="py-20 bg-navy text-white relative">
      <div className="absolute top-0 left-0 w-92 h-92 bg-orange/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-92 h-92 bg-navy-light/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Info Panel */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange/20 border border-orange/40 text-orange-light text-xs font-semibold uppercase tracking-widest rounded-full mb-4">
              Online Request Center
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-white tracking-tight mb-6">
              Instant Global Cargo Logistics
            </h2>
            <p className="text-white/70 text-base leading-relaxed mb-8">
              Submit an international shipping quotation inquiry or schedule a direct package pickup and door-to-door delivery.
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange text-white flex items-center justify-center shrink-0">
                  <Plane size={20} />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-white text-sm">
                    Air Freight & Express
                  </h4>
                  <p className="text-xs text-white/60 mt-0.5">
                    Express cargo handling, tracking, and priority customs clearance globally.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-white text-sm">
                    Master Tracking Reference
                  </h4>
                  <p className="text-xs text-white/60 mt-0.5">
                    Every quote and booking automatically registers a master tracking reference code.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="lg:col-span-7 bg-navy-light/95 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-white/10 shadow-2xl">
            {submitted ? (
              <div className="text-center py-10 space-y-6">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <h3 className="text-2xl font-heading font-bold text-white">
                    {activeForm === "quote" ? "Quotation Request Received!" : "Shipment Booked Successfully!"}
                  </h3>
                  <p className="text-white/70 text-sm mt-2">
                    Your request has been saved. Use the reference ID below to track its status.
                  </p>
                </div>

                <div className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-white/5 border border-white/15 rounded-xl font-mono text-orange text-xl font-extrabold tracking-wider mx-auto">
                  <span>{trackingId}</span>
                  <button
                    onClick={handleCopyCode}
                    className="p-1.5 text-white/40 hover:text-white rounded border border-transparent hover:border-white/10 transition-all"
                    title="Copy Code"
                  >
                    <ClipboardCopy size={16} />
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setQuoteForm(INITIAL_QUOTE_FORM);
                      setBookingForm(INITIAL_BOOKING_FORM);
                    }}
                    className="px-6 py-3 bg-orange text-white font-semibold rounded-lg hover:bg-orange-light text-sm"
                  >
                    New Request
                  </button>
                  <button
                    onClick={openWhatsApp}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg flex items-center gap-2 text-sm"
                  >
                    <MessageCircle size={18} /> Chat on WhatsApp
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Switch Tabs */}
                <div className="flex border-b border-white/10 pb-1">
                  <button
                    onClick={() => { setActiveForm("quote"); setErrors({}); }}
                    className={`flex-1 pb-3 text-center font-heading font-extrabold text-sm border-b-2 transition-all ${
                      activeForm === "quote" ? "border-orange text-orange font-black" : "border-transparent text-white/50 hover:text-white"
                    }`}
                  >
                    Rate Quote Inquiry
                  </button>
                  <button
                    onClick={() => { setActiveForm("booking"); setErrors({}); }}
                    className={`flex-1 pb-3 text-center font-heading font-extrabold text-sm border-b-2 transition-all ${
                      activeForm === "booking" ? "border-orange text-orange font-black" : "border-transparent text-white/50 hover:text-white"
                    }`}
                  >
                    Book Direct Shipment
                  </button>
                </div>

                {/* TAB 1: QUOTE FORM */}
                {activeForm === "quote" && (
                  <form onSubmit={handleQuoteSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-white/60 uppercase mb-2">Full Name *</label>
                        <input
                          type="text"
                          value={quoteForm.fullName}
                          onChange={(e) => setQuoteForm({ ...quoteForm, fullName: e.target.value })}
                          placeholder="Gbenga Oluremi"
                          className="w-full px-4 py-2.5 bg-navy border border-white/10 rounded-lg text-white text-sm placeholder-white/20 focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
                        />
                        {errors.fullName && <p className="text-red-400 text-[10px] mt-1">{errors.fullName}</p>}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-white/60 uppercase mb-2">Email Address *</label>
                        <input
                          type="email"
                          value={quoteForm.email}
                          onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                          placeholder="client@gmail.com"
                          className="w-full px-4 py-2.5 bg-navy border border-white/10 rounded-lg text-white text-sm placeholder-white/20 focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
                        />
                        {errors.email && <p className="text-red-400 text-[10px] mt-1">{errors.email}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <PhoneInput
                        phone={quoteForm.phone}
                        dialCode={quoteForm.dialCode}
                        onPhoneChange={(val) => setQuoteForm((prev) => ({ ...prev, phone: val }))}
                        onDialCodeChange={(val) => setQuoteForm((prev) => ({ ...prev, dialCode: val }))}
                        required
                        error={errors.phone}
                      />
                      <div>
                        <label className="block text-xs font-semibold text-white/60 uppercase mb-2">Freight Type *</label>
                        <select
                          value={quoteForm.freightType}
                          onChange={(e) => setQuoteForm({ ...quoteForm, freightType: e.target.value })}
                          className="w-full h-[42px] px-3 bg-navy border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-orange"
                        >
                          {FREIGHT_TYPES.map((ft) => (
                            <option key={ft.value} value={ft.value} className="bg-navy">{ft.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <CountrySelect
                        label="Origin Country"
                        value={quoteForm.originCountry}
                        onChange={(c) => setQuoteForm((prev) => ({ ...prev, originCountry: c.name, originCountryCode: c.code }))}
                        placeholder="Search origin..."
                        required
                        error={errors.originCountry}
                      />
                      <CountrySelect
                        label="Destination Country"
                        value={quoteForm.destinationCountry}
                        onChange={(c) => setQuoteForm((prev) => ({ ...prev, destinationCountry: c.name, destinationCountryCode: c.code }))}
                        placeholder="Search destination..."
                        required
                        error={errors.destinationCountry}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-white/60 uppercase mb-2">Cargo Description</label>
                        <input
                          type="text"
                          value={quoteForm.cargoDescription}
                          onChange={(e) => setQuoteForm({ ...quoteForm, cargoDescription: e.target.value })}
                          placeholder="e.g. Box of clothes, Gadgets"
                          className="w-full px-4 py-2.5 bg-navy border border-white/10 rounded-lg text-white text-sm placeholder-white/20 focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-white/60 uppercase mb-2">Weight (kg) *</label>
                        <input
                          type="number"
                          value={quoteForm.estimatedWeight}
                          onChange={(e) => setQuoteForm({ ...quoteForm, estimatedWeight: e.target.value })}
                          placeholder="15"
                          className="w-full px-4 py-2.5 bg-navy border border-white/10 rounded-lg text-white text-sm placeholder-white/20 focus:outline-none focus:border-orange focus:ring-1 focus:ring-orange"
                        />
                        {errors.estimatedWeight && <p className="text-red-400 text-[10px] mt-1">{errors.estimatedWeight}</p>}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-white/60 uppercase mb-2">Length (cm)</label>
                        <input
                          type="number"
                          value={quoteForm.lengthCm}
                          onChange={(e) => setQuoteForm({ ...quoteForm, lengthCm: e.target.value })}
                          placeholder="L"
                          className="w-full px-4 py-2 bg-navy border border-white/10 rounded-lg text-white text-sm placeholder-white/20 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-white/60 uppercase mb-2">Width (cm)</label>
                        <input
                          type="number"
                          value={quoteForm.widthCm}
                          onChange={(e) => setQuoteForm({ ...quoteForm, widthCm: e.target.value })}
                          placeholder="W"
                          className="w-full px-4 py-2 bg-navy border border-white/10 rounded-lg text-white text-sm placeholder-white/20 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-white/60 uppercase mb-2">Height (cm)</label>
                        <input
                          type="number"
                          value={quoteForm.heightCm}
                          onChange={(e) => setQuoteForm({ ...quoteForm, heightCm: e.target.value })}
                          placeholder="H"
                          className="w-full px-4 py-2 bg-navy border border-white/10 rounded-lg text-white text-sm placeholder-white/20 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-white/60 uppercase mb-2">Optional Notes</label>
                      <textarea
                        value={quoteForm.additionalMessage}
                        onChange={(e) => setQuoteForm({ ...quoteForm, additionalMessage: e.target.value })}
                        placeholder="Please include value of each items, or special instructions here..."
                        rows={2}
                        className="w-full px-4 py-2 bg-navy border border-white/10 rounded-lg text-white text-sm placeholder-white/25 focus:outline-none focus:border-orange resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-orange text-white rounded-lg font-bold uppercase tracking-wider hover:bg-orange-light flex items-center justify-center gap-2 disabled:opacity-50 transition-all text-xs font-heading shadow-md"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      {loading ? "Generating quote..." : "Submit Quotation Request"}
                    </button>
                  </form>
                )}

                {/* TAB 2: BOOKING FORM */}
                {activeForm === "booking" && (
                  <form onSubmit={handleBookingSubmit} className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                    {/* Sender Section */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-extrabold text-orange uppercase tracking-wider pb-1 border-b border-white/5">Sender (Origin)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold text-white/50 uppercase">Full Name *</label>
                          <input
                            type="text"
                            value={bookingForm.senderName}
                            onChange={(e) => setBookingForm({ ...bookingForm, senderName: e.target.value })}
                            placeholder="Sender name"
                            className="w-full px-3 py-2 bg-navy border border-white/10 rounded-lg text-white text-xs placeholder-white/20 focus:outline-none"
                          />
                          {errors.senderName && <p className="text-red-400 text-[9px] mt-1">{errors.senderName}</p>}
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-white/50 uppercase">Email Address *</label>
                          <input
                            type="email"
                            value={bookingForm.senderEmail}
                            onChange={(e) => setBookingForm({ ...bookingForm, senderEmail: e.target.value })}
                            placeholder="sender@gmail.com"
                            className="w-full px-3 py-2 bg-navy border border-white/10 rounded-lg text-white text-xs placeholder-white/20 focus:outline-none"
                          />
                          {errors.senderEmail && <p className="text-red-400 text-[9px] mt-1">{errors.senderEmail}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold text-white/50 uppercase">Phone Number *</label>
                          <div className="flex gap-2">
                            <select
                              value={bookingForm.senderDialCode}
                              onChange={(e) => setBookingForm({ ...bookingForm, senderDialCode: e.target.value })}
                              className="bg-navy border border-white/10 rounded-lg text-xs text-white px-1 outline-none"
                            >
                              <option value="+234">+234</option>
                              <option value="+233">+233</option>
                              <option value="+1">+1</option>
                              <option value="+44">+44</option>
                            </select>
                            <input
                              type="tel"
                              value={bookingForm.senderPhone}
                              onChange={(e) => setBookingForm({ ...bookingForm, senderPhone: e.target.value })}
                              placeholder="Phone"
                              className="flex-1 px-3 py-2 bg-navy border border-white/10 rounded-lg text-white text-xs placeholder-white/20 focus:outline-none"
                            />
                          </div>
                          {errors.senderPhone && <p className="text-red-400 text-[9px] mt-1">{errors.senderPhone}</p>}
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-white/50 uppercase">Home Address *</label>
                          <input
                            type="text"
                            value={bookingForm.senderAddress}
                            onChange={(e) => setBookingForm({ ...bookingForm, senderAddress: e.target.value })}
                            placeholder="Home Address"
                            className="w-full px-3 py-2 bg-navy border border-white/10 rounded-lg text-white text-xs placeholder-white/20 focus:outline-none"
                          />
                          {errors.senderAddress && <p className="text-red-400 text-[9px] mt-1">{errors.senderAddress}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Receiver Section */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-extrabold text-orange uppercase tracking-wider pb-1 border-b border-white/5">Receiver (Destination)</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold text-white/50 uppercase">Full Name *</label>
                          <input
                            type="text"
                            value={bookingForm.receiverName}
                            onChange={(e) => setBookingForm({ ...bookingForm, receiverName: e.target.value })}
                            placeholder="Receiver name"
                            className="w-full px-3 py-2 bg-navy border border-white/10 rounded-lg text-white text-xs placeholder-white/20 focus:outline-none"
                          />
                          {errors.receiverName && <p className="text-red-400 text-[9px] mt-1">{errors.receiverName}</p>}
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-white/50 uppercase">Email Address *</label>
                          <input
                            type="email"
                            value={bookingForm.receiverEmail}
                            onChange={(e) => setBookingForm({ ...bookingForm, receiverEmail: e.target.value })}
                            placeholder="receiver@gmail.com"
                            className="w-full px-3 py-2 bg-navy border border-white/10 rounded-lg text-white text-xs placeholder-white/20 focus:outline-none"
                          />
                          {errors.receiverEmail && <p className="text-red-400 text-[9px] mt-1">{errors.receiverEmail}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold text-white/50 uppercase">Phone Number *</label>
                          <div className="flex gap-2">
                            <select
                              value={bookingForm.receiverDialCode}
                              onChange={(e) => setBookingForm({ ...bookingForm, receiverDialCode: e.target.value })}
                              className="bg-navy border border-white/10 rounded-lg text-xs text-white px-1 outline-none"
                            >
                              <option value="+234">+234</option>
                              <option value="+233">+233</option>
                              <option value="+1">+1</option>
                              <option value="+44">+44</option>
                            </select>
                            <input
                              type="tel"
                              value={bookingForm.receiverPhone}
                              onChange={(e) => setBookingForm({ ...bookingForm, receiverPhone: e.target.value })}
                              placeholder="Phone"
                              className="flex-1 px-3 py-2 bg-navy border border-white/10 rounded-lg text-white text-xs placeholder-white/20 focus:outline-none"
                            />
                          </div>
                          {errors.receiverPhone && <p className="text-red-400 text-[9px] mt-1">{errors.receiverPhone}</p>}
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-white/50 uppercase">Delivery Address *</label>
                          <input
                            type="text"
                            value={bookingForm.receiverAddress}
                            onChange={(e) => setBookingForm({ ...bookingForm, receiverAddress: e.target.value })}
                            placeholder="Delivery Address"
                            className="w-full px-3 py-2 bg-navy border border-white/10 rounded-lg text-white text-xs placeholder-white/20 focus:outline-none"
                          />
                          {errors.receiverAddress && <p className="text-red-400 text-[9px] mt-1">{errors.receiverAddress}</p>}
                        </div>
                      </div>
                    </div>

                    {/* Item details */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-extrabold text-orange uppercase tracking-wider pb-1 border-b border-white/5">Package & Specifics</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold text-white/50 uppercase">Name of Items *</label>
                          <input
                            type="text"
                            value={bookingForm.itemName}
                            onChange={(e) => setBookingForm({ ...bookingForm, itemName: e.target.value })}
                            placeholder="e.g. Box of clothes, Gadgets"
                            className="w-full px-3 py-2 bg-navy border border-white/10 rounded-lg text-white text-xs placeholder-white/20 focus:outline-none"
                          />
                          {errors.itemName && <p className="text-red-400 text-[9px] mt-1">{errors.itemName}</p>}
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-white/50 uppercase">Weight (kg) *</label>
                          <input
                            type="number"
                            value={bookingForm.weight}
                            onChange={(e) => setBookingForm({ ...bookingForm, weight: e.target.value })}
                            placeholder="Est. Weight"
                            className="w-full px-3 py-2 bg-navy border border-white/10 rounded-lg text-white text-xs placeholder-white/20 focus:outline-none"
                          />
                          {errors.weight && <p className="text-red-400 text-[9px] mt-1">{errors.weight}</p>}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-semibold text-white/50 uppercase">Category</label>
                          <select
                            value={bookingForm.packageType}
                            onChange={(e) => setBookingForm({ ...bookingForm, packageType: e.target.value })}
                            className="w-full h-[34px] px-2 bg-navy border border-white/10 rounded-lg text-white text-xs focus:outline-none"
                          >
                            <option value="general">General Cargo</option>
                            <option value="electronics">Electronics</option>
                            <option value="documents">Documents</option>
                            <option value="fragile">Fragile items</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-semibold text-white/50 uppercase">Delivery Mode</label>
                          <select
                            value={bookingForm.deliveryType}
                            onChange={(e) => setBookingForm({ ...bookingForm, deliveryType: e.target.value })}
                            className="w-full h-[34px] px-2 bg-navy border border-white/10 rounded-lg text-white text-xs focus:outline-none"
                          >
                            <option value="standard">Standard Global Delivery</option>
                            <option value="express">Express Priority Air</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 mt-4 bg-orange text-white rounded-lg font-bold uppercase tracking-wider hover:bg-orange-light flex items-center justify-center gap-2 disabled:opacity-50 transition-all text-xs font-heading shadow-md"
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      {loading ? "Registering Shipment..." : "Schedule Shipment Booking"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
