import React from "react";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const MODES = [
  {
    title: "Bike Dispatch",
    desc: "Fast pickup and delivery for documents, parcels, food items, and light packages.",
    image: "https://images.unsplash.com/photo-1581092335878-2d9ff86ca2bf?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Van Delivery",
    desc: "Reliable movement for cartons, business supplies, fragile goods, and medium-size deliveries.",
    image: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=900&q=80",
  },
  {
    title: "Truck Logistics",
    desc: "Bulk goods, equipment, furniture, and heavy delivery support for businesses and individuals.",
    image: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&w=900&q=80",
  },
];

export default function GlobalReach() {
  return (
    <section className="py-24 bg-navy overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="text-center mb-16">
          <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange">
            Global Reach
          </span>
          <h2 className="text-3xl lg:text-4xl font-heading font-bold text-white mt-3">
            Local & Business Logistics
Pickup, Delivery & Goods Movement
          </h2>
          <p className="text-white/50 max-w-xl mx-auto mt-4 leading-relaxed">
            Whether by air, sea, or road — we deliver your goods with precision, speed, and full visibility.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {MODES.map((mode, i) => (
            <motion.div
              key={mode.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative rounded-2xl overflow-hidden aspect-[3/4]"
            >
              <img
                src={mode.image}
                alt={mode.title}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8">
                <h3 className="text-xl font-heading font-bold text-white">{mode.title}</h3>
                <p className="text-white/60 text-sm mt-2 leading-relaxed">{mode.desc}</p>
                <Link
                  to="/services"
                  className="inline-flex items-center gap-1 mt-4 text-orange text-xs font-semibold uppercase tracking-wider hover:translate-x-1 transition-transform"
                >
                  Learn More <ArrowRight size={14} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}