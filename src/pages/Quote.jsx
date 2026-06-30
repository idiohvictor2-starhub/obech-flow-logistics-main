import React, { useState } from "react";
import { Send, CheckCircle2, Loader2, Bike, Truck, Package } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

const PICKUP_OPTIONS = [
  {
    value: "bike",
    label: "Bike Dispatch",
    description: "Small parcels, documents, food items, light packages",
    icon: Bike,
  },
  {
    value: "van",
    label: "Van Pickup",
    description: "Medium goods, cartons, business supplies, fragile items",
    icon: Package,
  },
  {
    value: "truck",
    label: "Truck Pickup",
    description: "Bulk goods, furniture, equipment, large deliveries",
    icon: Truck,
  },
];

const SIZE_OPTIONS = [
  "Small parcel / document",
  "Medium carton / box",
  "Large carton / multiple bags",
  "Heavy or bulky goods",
  "Not sure - let Obech Flow advise",
];

const INITIAL = {
  name: "",
  email: "",
  phone: "",
  company_name: "",
  pickup_address: "",
  delivery_address: "",
  pickup_city: "",
  delivery_city: "",
  goods_type: "",
  goods_size: "",
  estimated_weight: "",
  pickup_vehicle: "",
  preferred_date: "",
  preferred_time: "",
  message: "",
};

export default function Quote() {
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const set = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.name ||
      !form.phone ||
      !form.pickup_address ||
      !form.delivery_address ||
      !form.goods_type ||
      !form.goods_size ||
      !form.pickup_vehicle
    ) {
      toast({
        title: "Please complete the required booking details.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      console.log("Booking request:", form);
      setSubmitted(true);
      setForm(INITIAL);
    } catch (err) {
      toast({
        title: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <>
        <section className="bg-navy pt-32 pb-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
            <h1 className="text-4xl lg:text-5xl font-heading font-black text-white">
              Booking Request
            </h1>
          </div>
        </section>

        <section className="py-24 bg-steel">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center px-4"
          >
            <div className="w-20 h-20 bg-orange/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 size={40} className="text-orange" />
            </div>

            <h2 className="text-2xl font-heading font-bold text-navy">
              Booking Request Submitted
            </h2>

            <p className="text-muted-foreground mt-3 leading-relaxed">
              Thank you. Our logistics team will review your pickup details and
              contact you shortly to confirm the best vehicle, pricing, and pickup
              schedule.
            </p>
          </motion.div>
        </section>
      </>
    );
  }

  return (
    <>
      <section className="bg-navy pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange">
            Book Pickup
          </span>

          <h1 className="text-4xl lg:text-5xl font-heading font-black text-white mt-3">
            Book a Delivery
          </h1>

          <p className="text-white/60 max-w-xl mt-4 leading-relaxed">
            Tell us what you want to move, where we should pick it up, and where
            it is going. If you do not know the weight, simply choose the closest
            size and our team will advise.
          </p>
        </div>
      </section>

      <section className="py-16 bg-steel">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-10">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl border border-steel p-8 lg:p-12"
          >
            <h2 className="text-lg font-heading font-bold text-navy mb-8">
              Pickup Booking Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <InputField label="Full Name *" value={form.name} onChange={set("name")} placeholder="Your full name" />
              <InputField label="Phone Number *" value={form.phone} onChange={set("phone")} placeholder="+234 XXX XXX XXXX" />
              <InputField label="Email" value={form.email} onChange={set("email")} type="email" placeholder="you@example.com" />
              <InputField label="Company Name" value={form.company_name} onChange={set("company_name")} placeholder="Optional" />
              <InputField label="Pickup City / Area" value={form.pickup_city} onChange={set("pickup_city")} placeholder="Lagos, Abuja, Port Harcourt..." />
              <InputField label="Delivery City / Area" value={form.delivery_city} onChange={set("delivery_city")} placeholder="Destination city or area" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
              <TextAreaField label="Pickup Address *" value={form.pickup_address} onChange={set("pickup_address")} placeholder="Where should we pick up the goods?" />
              <TextAreaField label="Delivery Address *" value={form.delivery_address} onChange={set("delivery_address")} placeholder="Where should we deliver the goods?" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
              <InputField label="Goods Type *" value={form.goods_type} onChange={set("goods_type")} placeholder="Documents, clothes, electronics, food items..." />
              <InputField label="Estimated Weight" value={form.estimated_weight} onChange={set("estimated_weight")} placeholder="Optional e.g. 5kg, 20kg, not sure" />
            </div>

            <SelectField
              label="Goods Size *"
              value={form.goods_size}
              onChange={set("goods_size")}
              options={SIZE_OPTIONS}
              placeholder="Select closest size"
            />

            <div className="mt-8">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Pickup Type *
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PICKUP_OPTIONS.map((option) => {
                  const Icon = option.icon;
                  const active = form.pickup_vehicle === option.value;

                  return (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() =>
                        setForm((f) => ({ ...f, pickup_vehicle: option.value }))
                      }
                      className={`text-left rounded-xl border p-5 transition-all ${
                        active
                          ? "border-orange bg-orange/5 shadow-sm"
                          : "border-steel bg-white hover:border-orange/40"
                      }`}
                    >
                      <Icon className={active ? "text-orange" : "text-navy"} size={28} />
                      <h3 className="font-heading font-bold text-navy mt-4">
                        {option.label}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                        {option.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-8">
              <InputField label="Preferred Pickup Date" value={form.preferred_date} onChange={set("preferred_date")} type="date" />
              <InputField label="Preferred Pickup Time" value={form.preferred_time} onChange={set("preferred_time")} type="time" />
            </div>

            <div className="mt-5">
              <TextAreaField
                label="Additional Note"
                value={form.message}
                onChange={set("message")}
                placeholder="Any special instruction? Fragile item, cash on delivery, urgent pickup, contact person, etc."
                rows={4}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 flex items-center justify-center gap-2 px-8 py-4 bg-orange text-white font-semibold uppercase tracking-wider rounded-lg hover:bg-orange-light transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              {loading ? "Submitting Booking..." : "Book Pickup"}
            </button>
          </motion.form>
        </div>
      </section>
    </>
  );
}

function InputField({ label, value, onChange, type = "text", placeholder }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full border border-steel rounded-lg px-4 py-3 text-sm bg-white text-navy focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-colors"
      />
    </div>
  );
}

function TextAreaField({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        {label}
      </label>
      <textarea
        value={value}
        onChange={onChange}
        rows={rows}
        placeholder={placeholder}
        className="w-full border border-steel rounded-lg px-4 py-3 text-sm bg-white text-navy focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-colors resize-none"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options, placeholder }) {
  return (
    <div className="mt-5">
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        {label}
      </label>
      <select
        value={value}
        onChange={onChange}
        className="w-full border border-steel rounded-lg px-4 py-3 text-sm bg-white text-navy focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-colors"
      >
        <option value="">{placeholder}</option>
        {options.map((item) => (
          <option key={item} value={item}>
            {item}
          </option>
        ))}
      </select>
    </div>
  );
}