import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, PhoneCall, Globe } from "lucide-react";
import { getCmsData } from "@/utils/cmsStorage";

export default function CtaSection() {
  const [cta, setCta] = useState({
    headline: "Ready to Ship Worldwide?",
    text: "Let Obech Global Logistics move your cargo safely, quickly and professionally across the globe.",
    primaryBtnText: "Get a Quote",
    primaryBtnLink: "#quote-section",
    secondaryBtnText: "Contact Us",
    secondaryBtnLink: "/contact",
  });

  useEffect(() => {
    const cms = getCmsData();
    if (cms?.cta) {
      setCta(cms.cta);
    }

    const handleCmsUpdate = (e) => {
      if (e.detail?.cta) {
        setCta(e.detail.cta);
      }
    };
    window.addEventListener("obech_cms_updated", handleCmsUpdate);
    return () => window.removeEventListener("obech_cms_updated", handleCmsUpdate);
  }, []);

  const renderPrimary = () => {
    const isAnchor = cta.primaryBtnLink && cta.primaryBtnLink.startsWith("#");
    const className = "px-8 py-4 bg-orange text-white font-semibold rounded-lg hover:bg-orange-light transition-all shadow-lg shadow-orange/30 flex items-center justify-center gap-2 text-sm sm:text-base";

    if (isAnchor) {
      return (
        <a href={cta.primaryBtnLink} className={className}>
          {cta.primaryBtnText || "Get a Quote"} <ArrowRight size={18} />
        </a>
      );
    }

    return (
      <Link to={cta.primaryBtnLink || "/quote"} className={className}>
        {cta.primaryBtnText || "Get a Quote"} <ArrowRight size={18} />
      </Link>
    );
  };

  return (
    <section className="py-20 bg-gradient-to-br from-navy via-navy-light to-navy text-white relative overflow-hidden">
      {/* Decorative subtle grid background */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-orange-light text-xs font-semibold uppercase tracking-widest mb-6">
          <Globe size={14} /> International Freight Partner
        </div>

        <h2 className="text-3xl sm:text-5xl font-heading font-extrabold text-white tracking-tight mb-6">
          {cta.headline}
        </h2>

        <p className="text-base sm:text-xl text-white/80 max-w-2xl mx-auto leading-relaxed mb-10">
          {cta.text}
        </p>

        <div className="flex flex-wrap items-center justify-center gap-5">
          {renderPrimary()}
          <Link
            to={cta.secondaryBtnLink || "/contact"}
            className="px-8 py-4 bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            <PhoneCall size={18} /> {cta.secondaryBtnText || "Contact Us"}
          </Link>
        </div>
      </div>
    </section>
  );
}
