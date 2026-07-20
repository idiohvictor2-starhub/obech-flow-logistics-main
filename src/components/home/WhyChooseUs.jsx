import React from "react";
import {
  Globe,
  FileCheck2,
  ShieldCheck,
  SearchCheck,
  BadgePercent,
  Award,
} from "lucide-react";
import whyUsImg from "@/assets/images/why_us.jpg";

const FEATURES = [
  {
    icon: Globe,
    title: "Global Shipping Network",
    description:
      "Direct connections and freight lanes spanning North America, Europe, Asia, and across Africa.",
  },
  {
    icon: FileCheck2,
    title: "Fast Customs Clearance",
    description:
      "Expert documentation, duty processing, and tariff advisory for hassle-free port clearance.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Cargo Handling",
    description:
      "Strict security protocols, insured shipments, and specialized packing for high-value freight.",
  },
  {
    icon: SearchCheck,
    title: "Real-Time Shipment Tracking",
    description:
      "Live GPS & status updates for complete visibility from dispatch to door-to-door delivery.",
  },
  {
    icon: BadgePercent,
    title: "Competitive Freight Rates",
    description:
      "Transparent pricing models with volume discounts and zero hidden surcharge fees.",
  },
  {
    icon: Award,
    title: "Experienced Logistics Experts",
    description:
      "Dedicated freight managers providing 24/7 personalized support for your supply chain.",
  },
];

export default function WhyChooseUs() {
  return (
    <section className="py-20 bg-white text-navy border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column - Image & Highlights */}
          <div className="lg:col-span-5 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={whyUsImg}
                alt="International Logistics Excellence"
                className="w-full h-[450px] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-navy/90 via-navy/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white p-6 bg-navy/80 backdrop-blur-md rounded-xl border border-white/10">
                <span className="text-orange font-bold text-xs uppercase tracking-wider block mb-1">
                  Trusted Worldwide
                </span>
                <p className="text-sm font-semibold leading-snug">
                  Connecting international suppliers and African trade hubs with speed and precision.
                </p>
              </div>
            </div>
            {/* Decorative accent box */}
            <div className="hidden sm:block absolute -bottom-6 -right-6 w-32 h-32 bg-orange/10 rounded-2xl -z-10" />
          </div>

          {/* Right Column - Title & Features Grid */}
          <div className="lg:col-span-7">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange/10 text-orange font-semibold text-xs uppercase tracking-widest rounded-full mb-4">
              Why Partner With Us
            </div>
            <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-navy tracking-tight mb-6">
              World-Class Logistics Engineered For Performance
            </h2>
            <p className="text-gray-600 mb-10 text-base leading-relaxed">
              At Obech Global Logistics, we bridge geographical divides with reliable air freight, sea freight, and express courier solutions tailored for growing businesses.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {FEATURES.map((item, index) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={index}
                    className="p-5 rounded-xl border border-gray-100 bg-steel/20 hover:bg-white hover:shadow-md hover:border-orange/20 transition-all duration-300 flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-orange/10 text-orange flex items-center justify-center shrink-0 mt-0.5">
                      <IconComp size={20} />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-base text-navy mb-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-gray-600 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}