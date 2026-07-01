import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowRight, Clock, Globe, Plane, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { usePhotoUrl } from "@/utils/photoStorage";

const STATS = [
  { icon: Clock, value: "8+", label: "Years Experience" },
  { icon: Globe, value: "Global", label: "Trade Routes" },
  { icon: Plane, value: "Air, Sea", label: "& Door-to-Door" },
  { icon: Eye, value: "Real-Time", label: "Visibility" },
];

export default function HeroSection() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const navigate = useNavigate();
  const heroBg = usePhotoUrl("hero_bg");

  const handleTrack = (e) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      navigate(`/tracking?tn=${encodeURIComponent(trackingNumber.trim())}`);
    }
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={heroBg}
          alt="Logistics warehouse with packages and delivery operations"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-navy via-navy/90 to-navy/70" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-32 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-3xl"
        >
          <span className="inline-block px-4 py-1.5 bg-orange/10 border border-orange/30 rounded text-orange text-xs font-mono font-semibold uppercase tracking-widest mb-6">
            Freight Forwarding & Logistics
          </span>

          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-heading font-black text-white leading-tight">
            Obech Global
            <br />
            <span className="text-orange">Logistics</span>
          </h1>

          <p className="text-xl sm:text-2xl text-white/90 font-heading font-semibold mt-4">
            We move it all
          </p>

          <p className="text-white/60 text-base sm:text-lg mt-4 max-w-xl leading-relaxed">
            Smart global logistics, freight forwarding, customs clearance, and door-to-door delivery for African businesses trading with the world.
          </p>

          <div className="flex flex-wrap gap-4 mt-8">
            <Link
              to="/tracking"
              className="flex items-center gap-2 px-7 py-3.5 bg-orange text-white font-semibold text-sm uppercase tracking-wider rounded hover:bg-orange-light transition-all hover:translate-x-1"
            >
              Track Shipment <ArrowRight size={16} />
            </Link>
            <Link
              to="/booking"
              className="flex items-center gap-2 px-7 py-3.5 border-2 border-white/20 text-white font-semibold text-sm uppercase tracking-wider rounded hover:border-orange hover:text-orange transition-all hover:translate-x-1"
            >
              Book a Delivery
            </Link>
          </div>
        </motion.div>

        {/* Tracking Bar */}
        <motion.form
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          onSubmit={handleTrack}
          className="mt-12 max-w-2xl backdrop-blur-xl bg-white/10 border border-white/15 rounded-xl p-2"
        >
          <div className="flex items-center">
            <div className="flex items-center gap-3 flex-1 px-4">
              <Search size={18} className="text-orange shrink-0" />
              <input
                type="text"
                placeholder="Enter tracking number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="flex-1 bg-transparent text-white placeholder:text-white/40 text-sm py-3 outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-orange text-white text-sm font-semibold uppercase tracking-wider rounded-lg hover:bg-orange-light transition-all whitespace-nowrap"
            >
              Track Now
            </button>
          </div>
        </motion.form>
      </div>

      {/* Stats Ticker */}
      <div className="relative z-10 mt-auto border-t border-white/10 bg-navy/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/10">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                className="py-6 px-4 lg:px-6 flex items-center gap-4"
              >
                <stat.icon size={20} className="text-orange shrink-0" />
                <div>
                  <div className="text-white font-heading font-bold text-lg">{stat.value}</div>
                  <div className="text-white/40 text-xs uppercase tracking-wider">{stat.label}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}