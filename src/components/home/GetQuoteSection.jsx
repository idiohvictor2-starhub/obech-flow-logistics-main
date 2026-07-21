import React, { useState, useEffect } from "react";
import { Send, MessageCircle, CheckCircle2, Loader2, Plane, Ship, PackageCheck, Info, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { saveQuoteRequest, getCmsData } from "@/utils/cmsStorage";
import CountrySelect from "@/components/ui/CountrySelect";
import PhoneInput from "@/components/ui/PhoneInput";
import { COUNTRIES } from "@/data/countries";

const FREIGHT_TYPES = [
  { value: "Air Express", label: "Air Express", icon: Plane },
  { value: "Air Cargo", label: "Air Cargo", icon: Plane },
  { value: "Sea Freight", label: "Sea Freight", icon: Ship },
];

const INITIAL_FORM = {
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

export default function GetQuoteSection() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [trackingId, setTrackingId] = useState("");
  const [errors, setErrors] = useState({});
  const [whatsappNumber, setWhatsappNumber] = useState("+2349066755440");
  const { toast } = useToast();

  useEffect(() => {
    const cms = getCmsData();
    if (cms?.settings?.whatsappNumber) {
      setWhatsappNumber(cms.settings.whatsappNumber);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Compute volumetric weight if dimensions are present: (L x W x H) / 5000
  const length = parseFloat(form.lengthCm) || 0;
  const width = parseFloat(form.widthCm) || 0;
  const height = parseFloat(form.heightCm) || 0;
  const volumetricWeight = (length > 0 && width > 0 && height > 0)
    ? ((length * width * height) / 5000).toFixed(2)
    : null;

  const validateForm = () => {
    const newErrors = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!form.email.trim()) newErrors.email = "Email Address is required";
    if (!form.phone.trim()) newErrors.phone = "Phone Number is required";
    if (!form.originCountry) newErrors.originCountry = "Origin Country is mandatory";
    if (!form.destinationCountry) newErrors.destinationCountry = "Destination Country is mandatory";
    if (!form.estimatedWeight || parseFloat(form.estimatedWeight) <= 0) {
      newErrors.estimatedWeight = "Please provide an estimated weight (kg)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all mandatory fields (Name, Email, Phone, Origin & Destination Countries, and Weight).",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const dimensions = (length > 0 && width > 0 && height > 0)
        ? `${length}x${width}x${height} cm`
        : "";

      const payload = {
        ...form,
        dimensions,
        volumetricWeight,
      };

      const result = await saveQuoteRequest(payload);
      setTrackingId(result.tracking_id);
      setSubmitted(true);
      toast({
        title: "Quotation Request Submitted!",
        description: `Reference #${result.tracking_id}. Our freight team is processing your shipping rate.`,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Submission Error",
        description: "Could not save your quotation request. Please try again or chat on WhatsApp.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = () => {
    const cleanNumber = whatsappNumber.replace(/[^0-9]/g, "");
    const text = encodeURIComponent(
      `Hello Obech Global Logistics! I'd like a quotation for ${form.freightType}.\nOrigin: ${form.originCountry} (${form.originCountryCode})\nDestination: ${form.destinationCountry} (${form.destinationCountryCode})\nWeight: ${form.estimatedWeight || "N/A"} kg\nName: ${form.fullName || "N/A"}`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, "_blank");
  };

  return (
    <section id="quote-section" className="py-20 bg-navy text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left info column */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange/20 border border-orange/40 text-orange-light text-xs font-semibold uppercase tracking-widest rounded-full mb-4">
              Instant Freight Quotation
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-white tracking-tight mb-6">
              Get an International Shipping Quote
            </h2>
            <p className="text-white/70 text-base leading-relaxed mb-8">
              Fast, transparent rate calculations for Air Freight, Sea Freight, and Express Courier shipping connecting 240+ countries and territories worldwide.
            </p>

            <div className="space-y-4 mb-8">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-orange text-white flex items-center justify-center shrink-0">
                  <Plane size={20} />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-white text-sm">
                    Flagship Global Air Cargo
                  </h4>
                  <p className="text-xs text-white/60 mt-0.5">
                    Express airport-to-airport and door-to-door delivery with priority customs clearance.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-white text-sm">
                    Guaranteed Rate & Support
                  </h4>
                  <p className="text-xs text-white/60 mt-0.5">
                    Zero hidden fees. Transparent volumetric & actual weight processing with dedicated freight managers.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right form column */}
          <div className="lg:col-span-7 bg-navy-light/90 backdrop-blur-md p-6 sm:p-10 rounded-2xl border border-white/10 shadow-2xl">
            {submitted ? (
              <div className="text-center py-10">
                <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-2xl font-heading font-bold text-white mb-2">
                  Quotation Request Submitted!
                </h3>
                <p className="text-white/70 text-sm max-w-md mx-auto mb-6">
                  Thank you, <strong className="text-white">{form.fullName}</strong>. Your reference ID is:
                </p>
                <div className="inline-block px-6 py-3 bg-white/10 rounded-lg border border-white/20 font-mono text-orange text-xl font-extrabold tracking-wider mb-8">
                  {trackingId}
                </div>
                <p className="text-xs text-white/50 mb-8">
                  Our international logistics specialists are reviewing your shipping specs ({form.originCountry} → {form.destinationCountry}) and will send a detailed breakdown shortly.
                </p>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setForm(INITIAL_FORM);
                    }}
                    className="px-6 py-3 bg-orange text-white font-semibold rounded-lg hover:bg-orange-light text-sm"
                  >
                    Submit Another Quote
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
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
                      Full Name <span className="text-orange">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="e.g. Gbenga Oluremi"
                      className={`w-full px-4 py-3 bg-navy border ${
                        errors.fullName ? "border-red-500" : "border-white/15"
                      } rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-orange transition-colors`}
                    />
                    {errors.fullName && <span className="text-xs text-red-400 mt-1 block">{errors.fullName}</span>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
                      Email Address <span className="text-orange">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      className={`w-full px-4 py-3 bg-navy border ${
                        errors.email ? "border-red-500" : "border-white/15"
                      } rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-orange transition-colors`}
                    />
                    {errors.email && <span className="text-xs text-red-400 mt-1 block">{errors.email}</span>}
                  </div>
                </div>

                {/* Phone & Freight Type */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <PhoneInput
                    phone={form.phone}
                    dialCode={form.dialCode}
                    onPhoneChange={(val) => setForm((prev) => ({ ...prev, phone: val }))}
                    onDialCodeChange={(val) => setForm((prev) => ({ ...prev, dialCode: val }))}
                    required
                    error={errors.phone}
                  />

                  <div>
                    <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
                      Freight Type <span className="text-orange">*</span>
                    </label>
                    <select
                      name="freightType"
                      value={form.freightType}
                      onChange={handleChange}
                      className="w-full h-[46px] px-4 bg-navy border border-white/15 rounded-lg text-white text-sm focus:outline-none focus:border-orange transition-colors"
                    >
                      {FREIGHT_TYPES.map((ft) => (
                        <option key={ft.value} value={ft.value} className="bg-navy text-white">
                          {ft.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Searchable Origin & Destination Country Dropdowns */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <CountrySelect
                    label="Origin Country"
                    value={form.originCountry}
                    onChange={(country) =>
                      setForm((prev) => ({
                        ...prev,
                        originCountry: country.name,
                        originCountryCode: country.code,
                      }))
                    }
                    placeholder="Search origin country..."
                    required
                    error={errors.originCountry}
                  />

                  <CountrySelect
                    label="Destination Country"
                    value={form.destinationCountry}
                    onChange={(country) =>
                      setForm((prev) => ({
                        ...prev,
                        destinationCountry: country.name,
                        destinationCountryCode: country.code,
                      }))
                    }
                    placeholder="Search destination country..."
                    required
                    error={errors.destinationCountry}
                  />
                </div>

                {/* Cargo Description & Weight */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
                      Cargo Description
                    </label>
                    <input
                      type="text"
                      name="cargoDescription"
                      value={form.cargoDescription}
                      onChange={handleChange}
                      placeholder="e.g. Electronics, Clothing, Machinery"
                      className="w-full px-4 py-3 bg-navy border border-white/15 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-orange transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
                      Est. Weight (kg) <span className="text-orange">*</span>
                    </label>
                    <input
                      type="number"
                      name="estimatedWeight"
                      value={form.estimatedWeight}
                      onChange={handleChange}
                      placeholder="e.g. 50"
                      className={`w-full px-4 py-3 bg-navy border ${
                        errors.estimatedWeight ? "border-red-500" : "border-white/15"
                      } rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-orange transition-colors`}
                    />
                    {errors.estimatedWeight && <span className="text-xs text-red-400 mt-1 block">{errors.estimatedWeight}</span>}
                  </div>
                </div>

                {/* Optional Box Dimensions (L x W x H cm) */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-white/80 uppercase tracking-wider">
                      Box Dimension (cm) - Optional
                    </label>
                    {volumetricWeight && (
                      <span className="text-xs text-orange font-mono font-semibold">
                        Volumetric Wt: {volumetricWeight} kg
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="number"
                      name="lengthCm"
                      value={form.lengthCm}
                      onChange={handleChange}
                      placeholder="L (cm)"
                      className="w-full px-3 py-2.5 bg-navy border border-white/15 rounded-lg text-white text-xs placeholder-white/40 focus:outline-none focus:border-orange"
                    />
                    <input
                      type="number"
                      name="widthCm"
                      value={form.widthCm}
                      onChange={handleChange}
                      placeholder="W (cm)"
                      className="w-full px-3 py-2.5 bg-navy border border-white/15 rounded-lg text-white text-xs placeholder-white/40 focus:outline-none focus:border-orange"
                    />
                    <input
                      type="number"
                      name="heightCm"
                      value={form.heightCm}
                      onChange={handleChange}
                      placeholder="H (cm)"
                      className="w-full px-3 py-2.5 bg-navy border border-white/15 rounded-lg text-white text-xs placeholder-white/40 focus:outline-none focus:border-orange"
                    />
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
                    Additional Notes / Special Requirements
                  </label>
                  <textarea
                    name="additionalMessage"
                    value={form.additionalMessage}
                    onChange={handleChange}
                    rows={2}
                    placeholder="Provide any extra details (e.g. Value of each items, door delivery, special handling, etc.)"
                    className="w-full px-4 py-2.5 bg-navy border border-white/15 rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-orange transition-colors resize-none"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto flex-1 py-3.5 px-8 bg-orange text-white font-semibold rounded-lg hover:bg-orange-light transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange/20 text-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> Processing...
                      </>
                    ) : (
                      <>
                        <Send size={18} /> Request Quote
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={openWhatsApp}
                    className="w-full sm:w-auto py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 text-sm"
                  >
                    <MessageCircle size={18} /> Chat on WhatsApp
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
