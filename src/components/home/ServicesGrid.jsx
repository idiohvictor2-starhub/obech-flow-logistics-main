import React from "react";
import { Link } from "react-router-dom";
import { Plane, Ship, Globe2, ArrowRight } from "lucide-react";

const SERVICES = [
  {
    id: "air-freight",
    title: "Air Freight",
    isFlagship: true,
    icon: Plane,
    description:
      "We provide individuals and businesses with comprehensive, end-to-end logistics services, ensuring the safe and reliable delivery of shipments of any size. From exporting personal effects and household goods to commercial products and beyond, we’ve got you covered. With our motto, “your package our priority,” you can trust that your goods are always in safe hands",
    ctaText: "Get Air Freight Quote",
    ctaLink: "#quote-section",
  },
  {
    id: "sea-freight",
    title: "Sea Freight",
    isFlagship: false,
    icon: Ship,
    description:
      "Our Sea Freight solutions provide cost-efficient transportation for large volumes of goods across the globe. Whether you’re shipping full container loads (FCL) or less-than-container loads (LCL), we ensure seamless delivery through major international ports. With an emphasis on reliability, sustainability, and affordability, our Sea Freight service is ideal for heavy cargo and bulk shipments.",
    ctaText: "Get Sea Freight Quote",
    ctaLink: "#quote-section",
  },
];

const COURIER_PARTNERS = [
  {
    name: "DHL",
    color: "bg-[#FFCC00] text-[#D40511]",
    borderColor: "border-[#FFCC00]",
    badge: "Express Global",
    tagline: "Worldwide Parcel & Document Express",
  },
  {
    name: "UPS",
    color: "bg-[#351C15] text-[#FFB500]",
    borderColor: "border-[#351C15]",
    badge: "Logistics Partner",
    tagline: "Trusted International Logistics & Courier",
  },
  {
    name: "FedEx",
    color: "bg-[#4D148C] text-[#FF6600]",
    borderColor: "border-[#4D148C]",
    badge: "Air Express",
    tagline: "Fast Cross-Border Priority Deliveries",
  },
];

export default function ServicesGrid() {
  return (
    <section className="py-20 bg-steel/30 text-navy">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 border border-orange/30 bg-orange/10 text-orange font-semibold text-xs uppercase tracking-widest rounded-full mb-3">
            World-Class Freight & Delivery
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-navy tracking-tight">
            International Freight & Courier Services
          </h2>
          <p className="text-gray-600 mt-4 text-base sm:text-lg">
            Empowering businesses across continents with fast, secure, and compliant global cargo shipping solutions.
          </p>
        </div>

        {/* Core Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {SERVICES.map((srv) => {
            const IconComp = srv.icon;
            return (
              <div
                key={srv.id}
                className={`relative rounded-2xl p-8 transition-all duration-300 flex flex-col justify-between ${
                  srv.isFlagship
                    ? "bg-navy text-white shadow-xl shadow-navy/20 border-2 border-orange"
                    : "bg-white text-navy border border-gray-200 hover:shadow-lg hover:border-gray-300"
                }`}
              >
                {srv.isFlagship && (
                  <div className="absolute -top-3.5 right-8 bg-orange text-white text-xs font-bold uppercase tracking-wider px-4 py-1 rounded-full shadow-sm">
                    Flagship Service
                  </div>
                )}

                <div>
                  <div
                    className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 ${
                      srv.isFlagship
                        ? "bg-orange text-white"
                        : "bg-orange/10 text-orange"
                    }`}
                  >
                    <IconComp size={28} />
                  </div>

                  <h3
                    className={`text-2xl font-heading font-bold mb-3 ${
                      srv.isFlagship ? "text-white" : "text-navy"
                    }`}
                  >
                    {srv.title}
                  </h3>

                  <p
                    className={`text-base leading-relaxed mb-8 ${
                      srv.isFlagship ? "text-white/80" : "text-gray-600"
                    }`}
                  >
                    {srv.description}
                  </p>
                </div>

                <div>
                  <a
                    href={srv.ctaLink}
                    className={`w-full py-3.5 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-all ${
                      srv.isFlagship
                        ? "bg-orange text-white hover:bg-orange-light shadow-md"
                        : "bg-navy text-white hover:bg-navy-light"
                    }`}
                  >
                    {srv.ctaText} <ArrowRight size={18} />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Express Courier Partners Card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-gray-100 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-orange/10 text-orange flex items-center justify-center shrink-0">
                <Globe2 size={26} />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-heading font-bold text-navy">
                  Express Courier Partners
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Global express shipping through trusted international courier partners.
                </p>
              </div>
            </div>
            <a
              href="#quote-section"
              className="inline-flex items-center gap-2 text-sm font-semibold text-orange hover:text-orange-dark transition-colors self-start md:self-auto"
            >
              Get Express Courier Quote <ArrowRight size={16} />
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COURIER_PARTNERS.map((partner) => (
              <div
                key={partner.name}
                className="group p-6 rounded-xl border border-gray-100 bg-steel/20 hover:bg-white hover:shadow-md hover:border-orange/30 transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`px-4 py-1.5 rounded-md font-heading font-black text-lg tracking-wider ${partner.color}`}
                  >
                    {partner.name}
                  </div>
                  <span className="text-[11px] font-semibold tracking-wider text-gray-500 uppercase bg-gray-200/60 px-2.5 py-1 rounded">
                    {partner.badge}
                  </span>
                </div>
                <p className="text-xs text-gray-600 font-medium leading-relaxed">
                  {partner.tagline}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}