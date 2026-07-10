import React, { useState } from "react";
import { Send, MapPin, Phone, Mail, CheckCircle2, Loader2, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";

const INITIAL = { name: "", email: "", phone: "", message: "" };

export default function Contact() {
  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({ title: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
  const messages = JSON.parse(
    localStorage.getItem("obech_contact_messages") || "[]"
  );

  messages.push({
    id: Date.now(),
    ...form,
    created_at: new Date().toISOString(),
  });

  localStorage.setItem(
    "obech_contact_messages",
    JSON.stringify(messages)
  );

  setSubmitted(true);
  setForm(INITIAL);
} catch (err) {
  toast({
    title: "Unable to save your message.",
    variant: "destructive",
  });
} finally {
  setLoading(false);
}
  };

  return (
    <>
      {/* Hero */}
      <section className="bg-navy pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange">
            Get in Touch
          </span>
          <h1 className="text-4xl lg:text-5xl font-heading font-black text-white mt-3">
            Contact Us
          </h1>
          <p className="text-white/60 max-w-xl mt-4 leading-relaxed">
            Have a question or need a logistics consultation? We're here to help.
          </p>
        </div>
      </section>

      <section className="py-16 bg-steel">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid lg:grid-cols-5 gap-10">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-navy rounded-2xl p-8">
                <h3 className="text-lg font-heading font-bold text-white mb-6">Office Information</h3>
                <div className="space-y-5">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-orange/10 flex items-center justify-center shrink-0">
                      <MapPin size={18} className="text-orange" />
                    </div>
                    <div className="flex flex-col gap-4">
                      <div>
                        <p className="text-xs text-white/40 uppercase tracking-wider">Main Office</p>
                        <a href="https://maps.google.com/?q=21+road+opposite+I+close,+Festac+town,+Lagos" target="_blank" rel="noopener noreferrer" className="text-white text-sm mt-1 block hover:text-orange transition-colors">
                          21 road opposite I close, Festac town, Lagos
                        </a>
                      </div>
                      <div>
                        <p className="text-xs text-white/40 uppercase tracking-wider">Drop-off Location</p>
                        <a href="https://maps.google.com/?q=2+Kunle+Akinosi+St,+Orile+Oshodi+102214,+Lagos+100261" target="_blank" rel="noopener noreferrer" className="text-white text-sm mt-1 block hover:text-orange transition-colors">
                          2 Kunle Akinosi St, Orile Oshodi 102214, Lagos 100261<br/>
                          <span className="text-white/60 text-xs">(Beside Greenews Hotel)</span>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-orange/10 flex items-center justify-center shrink-0">
                      <Phone size={18} className="text-orange" />
                    </div>
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wider">Phone</p>
                      <a href="tel:+2349066755440" className="text-white text-sm mt-1 block hover:text-orange transition-colors">
                        +2349066755440
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-orange/10 flex items-center justify-center shrink-0">
                      <Mail size={18} className="text-orange" />
                    </div>
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wider">Email</p>
                      <a href="mailto:info@obechlogistics.com" className="text-white text-sm mt-1 block hover:text-orange transition-colors break-all">
                        info@obechlogistics.com
                      </a>
                      <a href="mailto:obechlogistics@gmail.com" className="text-white text-sm mt-1 block hover:text-orange transition-colors break-all">
                        obechlogistics@gmail.com
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-orange/10 flex items-center justify-center shrink-0">
                      <Clock size={18} className="text-orange" />
                    </div>
                    <div>
                      <p className="text-xs text-white/40 uppercase tracking-wider">Business Hours</p>
                      <p className="text-white text-sm mt-1">Mon – Fri: 8:00 AM – 6:00 PM</p>
                      <p className="text-white/50 text-sm">Sat: 9:00 AM – 2:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white rounded-2xl border border-steel p-12 text-center"
                >
                  <div className="w-20 h-20 bg-orange/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} className="text-orange" />
                  </div>
                  <h2 className="text-2xl font-heading font-bold text-navy">Message Sent</h2>
                  <p className="text-muted-foreground mt-3">
                    Thank you for reaching out. We'll get back to you as soon as possible.
                  </p>
                </motion.div>
              ) : (
                <motion.form
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onSubmit={handleSubmit}
                  className="bg-white rounded-2xl border border-steel p-8 lg:p-12"
                >
                  <h2 className="text-lg font-heading font-bold text-navy mb-8">Send Us a Message</h2>
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={set("name")}
                        placeholder="Your full name"
                        className="w-full border border-steel rounded-lg px-4 py-3 text-sm bg-white text-navy focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={set("email")}
                        placeholder="your@email.com"
                        className="w-full border border-steel rounded-lg px-4 py-3 text-sm bg-white text-navy focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-colors"
                      />
                    </div>
                  </div>
                  <div className="mt-5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={set("phone")}
                      placeholder="+234 XXX XXX XXXX"
                      className="w-full border border-steel rounded-lg px-4 py-3 text-sm bg-white text-navy focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-colors"
                    />
                  </div>
                  <div className="mt-5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Message *
                    </label>
                    <textarea
                      value={form.message}
                      onChange={set("message")}
                      rows={5}
                      placeholder="How can we help you?"
                      className="w-full border border-steel rounded-lg px-4 py-3 text-sm bg-white text-navy focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange transition-colors resize-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-8 flex items-center justify-center gap-2 px-8 py-4 bg-orange text-white font-semibold uppercase tracking-wider rounded-lg hover:bg-orange-light transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    {loading ? "Sending..." : "Send Message"}
                  </button>
                </motion.form>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}