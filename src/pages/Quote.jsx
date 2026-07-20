import React from "react";
import GetQuoteSection from "@/components/home/GetQuoteSection";
import { Globe } from "lucide-react";

export default function Quote() {
  return (
    <>
      {/* Hero Header */}
      <section className="bg-navy pt-32 pb-16 text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange/20 border border-orange/40 text-orange-light text-xs font-semibold uppercase tracking-widest rounded-full mb-3">
            <Globe size={14} /> International Shipping Calculator
          </div>
          <h1 className="text-4xl lg:text-5xl font-heading font-black text-white mt-2">
            Request an International Quotation
          </h1>
          <p className="text-white/70 max-w-2xl mt-4 leading-relaxed text-base lg:text-lg">
            Instant shipping rate requests for Air Freight, Sea Cargo, and Express Courier delivery connecting 240+ countries.
          </p>
        </div>
      </section>

      {/* Main Quote Form Section */}
      <GetQuoteSection />
    </>
  );
}