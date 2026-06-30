import React from "react";
import { Link } from "react-router-dom";
import { Plane, Ship, Truck, FileCheck, MapPin, PackageCheck, Warehouse, Briefcase, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const SERVICES = [
  { icon: Plane, title: "Air Freight", desc: "Fast, reliable air cargo for time-sensitive shipments across global trade corridors." },
  { icon: Ship, title: "Ocean Freight", desc: "Cost-effective sea freight with FCL and LCL options for intercontinental cargo movement." },
  { icon: Truck, title: "Door-to-Door DDP", desc: "End-to-end delivery with duties and taxes pre-paid. From origin warehouse to final destination." },
  { icon: FileCheck, title: "Customs Clearance", desc: "Expert customs brokerage ensuring smooth, compliant import and export documentation." },
  { icon: MapPin, title: "Cargo Tracking", desc: "Real-time shipment visibility with live tracking across every stage of the logistics chain." },
  { icon: PackageCheck, title: "Import & Export Support", desc: "Full-service trade facilitation: documentation, compliance, and regulatory guidance." },
  { icon: Warehouse, title: "Warehousing & Distribution", desc: "Secure, strategically located warehouse facilities with inventory management solutions." },
  { icon: Briefcase, title: "Business Shipping Solutions", desc: "Tailored logistics programs for SMEs and enterprises trading across borders." },
];

export default function ServicesGrid() {
  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-16">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange">
            What We Do
          </span>
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-navy mt-3">
            Our Services
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mt-4 leading-relaxed">
            Comprehensive logistics solutions engineered for African businesses competing on the global stage.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0.5 bg-steel rounded-2xl overflow-hidden">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                to="/services"
                className="group block bg-white p-8 h-full transition-all duration-300 hover:bg-navy"
              >
                <service.icon
                  size={28}
                  strokeWidth={1.5}
                  className="text-orange mb-6 transition-transform duration-300 group-hover:translate-x-1"
                />
                <h3 className="text-lg font-heading font-bold text-navy group-hover:text-white transition-colors">
                  {service.title}
                </h3>
                <p className="text-sm text-muted-foreground group-hover:text-white/60 mt-3 leading-relaxed transition-colors">
                  {service.desc}
                </p>
                <div className="flex items-center gap-1 mt-6 text-orange text-xs font-semibold uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-all translate-x-0 group-hover:translate-x-1">
                  Learn More <ArrowRight size={14} />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}