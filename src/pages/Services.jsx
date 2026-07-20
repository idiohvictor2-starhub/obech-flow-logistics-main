import React from "react";
import { Link } from "react-router-dom";
import { Plane, Ship, PackageCheck, ArrowRight, Globe } from "lucide-react";
import { motion } from "framer-motion";
import airFreightImg from "@/assets/images/hero_air_freight_1.png";
import seaFreightImg from "@/assets/images/hero_seaport_warehouse_3.png";

export default function Services() {
  const services = [
    {
      icon: Plane,
      title: "Global Air Freight",
      desc: "We provide individuals and businesses with comprehensive, end-to-end logistics services, ensuring the safe and reliable delivery of shipments of any size. From exporting personal effects and household goods to commercial products and beyond, we’ve got you covered. With our motto, “your package our priority,” you can trust that your goods are always in safe hands",
      image: airFreightImg,
      isFlagship: true,
    },
    {
      icon: Ship,
      title: "Ocean & Sea Freight",
      desc: "Our Sea Freight solutions provide cost-efficient transportation for large volumes of goods across the globe. Whether you’re shipping full container loads (FCL) or less-than-container loads (LCL), we ensure seamless delivery through major international ports. With an emphasis on reliability, sustainability, and affordability, our Sea Freight service is ideal for heavy cargo and bulk shipments.",
      image: seaFreightImg,
      isFlagship: false,
    },
    {
      icon: PackageCheck,
      title: "Express Courier Partners",
      desc: "Fast international document and parcel delivery powered by our strategic partnerships with global express networks including DHL, UPS, and FedEx.",
      image: null,
      isFlagship: false,
    },
  ];

  return (
    <>
      {/* Hero */}
      <section className="bg-navy pt-32 pb-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange/20 border border-orange/40 text-orange-light text-xs font-semibold uppercase tracking-widest rounded-full mb-3">
            <Globe size={14} /> International Freight & Logistics
          </div>
          <h1 className="text-4xl lg:text-5xl font-heading font-black text-white mt-2">
            Global Air & Sea Cargo Services
          </h1>
          <p className="text-white/70 max-w-2xl mt-4 leading-relaxed text-base lg:text-lg">
            World-class international air freight, ocean shipping, and express courier partner networks engineered for worldwide trade.
          </p>
        </div>
      </section>

      {/* Services List */}
      <section className="py-24 bg-steel/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 space-y-8">
          {services.map((service) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.05 }}
              className={`group grid ${service.image ? "lg:grid-cols-2" : "lg:grid-cols-1"} gap-0 bg-white border ${
                service.isFlagship ? "border-orange shadow-lg shadow-orange/10" : "border-gray-200"
              } rounded-2xl overflow-hidden hover:border-orange/40 transition-all`}
            >
              {service.image && (
                <div className="relative h-64 lg:h-auto overflow-hidden bg-navy">
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-navy/30" />
                  {service.isFlagship && (
                    <div className="absolute top-4 left-4 bg-orange text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-md shadow-md">
                      Flagship Service
                    </div>
                  )}
                </div>
              )}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-orange/10 text-orange flex items-center justify-center">
                    <service.icon size={26} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-heading font-bold text-navy">{service.title}</h3>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed text-base mb-8">{service.desc}</p>
                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                  <Link
                    to="/quote"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-orange text-white text-xs uppercase tracking-wider font-semibold rounded-md hover:bg-orange-light transition-all shadow-sm"
                  >
                    Get a Quote <ArrowRight size={14} />
                  </Link>
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">
                    Worldwide Delivery
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}