import React from "react";
import { Shield, Radar, FileSearch, Globe2, Cpu, Headphones } from "lucide-react";
import { motion } from "framer-motion";

const REASONS = [
  {
    icon: Shield,
    title: "Safe & Secure Delivery",
    desc: "Every shipment is handled with care from pickup to final delivery.",
  },
  {
    icon: Radar,
    title: "Live Tracking",
    desc: "Track your goods in real time with timely delivery updates.",
  },
  {
    icon: FileSearch,
    title: "Professional Dispatch Team",
    desc: "Experienced riders and drivers ensure fast and reliable service.",
  },
  {
    icon: Globe2,
    title: "Nationwide Coverage",
    desc: "Pickup and delivery services across major cities and business locations.",
  },
  {
    icon: Cpu,
    title: "Smart Logistics Technology",
    desc: "Digital booking, dispatch management, and shipment monitoring.",
  },
  {
    icon: Headphones,
    title: "24/7 Customer Support",
    desc: "Friendly support team ready to assist with every delivery.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-24 bg-steel">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Left */}
          <div className="lg:sticky lg:top-32">
            <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange">
              Why Obech
            </span>
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-navy mt-3">
              Why Choose Us
            </h2>
            <p className="text-muted-foreground mt-4 leading-relaxed">
              We combine deep logistics expertise with modern technology to deliver seamless, reliable, and transparent shipping solutions for businesses across Africa and the world.
            </p>
            <img
              src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=80"
              alt="Modern logistics and cargo transportation"
              className="mt-8 rounded-xl w-full object-cover"
            />
          </div>

          {/* Right */}
          <div className="space-y-4">
            {REASONS.map((reason, i) => (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="group bg-white rounded-xl p-6 border border-transparent hover:border-orange/20 transition-all hover:translate-x-1"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-navy flex items-center justify-center shrink-0">
                    <reason.icon size={20} className="text-orange" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-navy">{reason.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{reason.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}