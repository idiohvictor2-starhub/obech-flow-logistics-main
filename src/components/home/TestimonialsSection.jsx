import React, { useState, useEffect } from "react";
import { Star, Quote, User, ChevronLeft, ChevronRight } from "lucide-react";
import { getCmsData } from "@/utils/cmsStorage";

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState([]);
  const [mobileIndex, setMobileIndex] = useState(0);

  const loadTestimonials = () => {
    const cms = getCmsData();
    if (cms && cms.testimonials) {
      // sort by order if available
      const sorted = [...cms.testimonials].sort((a, b) => (a.order || 0) - (b.order || 0));
      setTestimonials(sorted);
    }
  };

  useEffect(() => {
    loadTestimonials();

    const handleCmsUpdate = (e) => {
      if (e.detail?.testimonials) {
        const sorted = [...e.detail.testimonials].sort((a, b) => (a.order || 0) - (b.order || 0));
        setTestimonials(sorted);
      }
    };
    window.addEventListener("obech_cms_updated", handleCmsUpdate);
    return () => window.removeEventListener("obech_cms_updated", handleCmsUpdate);
  }, []);

  if (!testimonials || testimonials.length === 0) return null;

  const renderStars = (rating = 5) => {
    return (
      <div className="flex items-center gap-1 text-amber-400">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            size={18}
            className={i < rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}
          />
        ))}
      </div>
    );
  };

  const handleNextMobile = () => {
    setMobileIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrevMobile = () => {
    setMobileIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1));
  };

  return (
    <section className="py-20 bg-steel/40 text-navy relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange/10 text-orange font-semibold text-xs uppercase tracking-widest rounded-full mb-3">
            Client Testimonials
          </div>
          <h2 className="text-3xl sm:text-4xl font-heading font-extrabold text-navy tracking-tight">
            What Our Global Clients Say
          </h2>
          <p className="text-gray-600 mt-3 text-base">
            Trusted by businesses, traders, and individuals worldwide for punctual & transparent freight delivery.
          </p>
        </div>

        {/* Desktop View: Multi-column grid (2-column on md/lg) */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between relative group"
            >
              <Quote className="absolute top-6 right-6 text-orange/15 w-14 h-14 pointer-events-none group-hover:text-orange/25 transition-colors" />

              <div>
                <div className="mb-4">{renderStars(item.rating)}</div>
                <p className="text-gray-700 text-base sm:text-lg italic leading-relaxed mb-8 relative z-10">
                  "{item.quote}"
                </p>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                {item.avatar ? (
                  <img
                    src={item.avatar}
                    alt={item.author}
                    className="w-12 h-12 rounded-full object-cover border-2 border-orange"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-navy text-white flex items-center justify-center font-bold text-lg">
                    {item.author ? item.author.charAt(0) : "U"}
                  </div>
                )}
                <div>
                  <h4 className="font-heading font-bold text-navy text-base">
                    {item.author}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium">
                    {item.role || "Satisfied Client"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile View: Responsive Carousel */}
        <div className="md:hidden relative">
          <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 relative">
            <Quote className="absolute top-4 right-4 text-orange/20 w-10 h-10 pointer-events-none" />

            <div className="mb-3">
              {renderStars(testimonials[mobileIndex]?.rating)}
            </div>

            <p className="text-gray-700 text-base italic leading-relaxed mb-6">
              "{testimonials[mobileIndex]?.quote}"
            </p>

            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              {testimonials[mobileIndex]?.avatar ? (
                <img
                  src={testimonials[mobileIndex].avatar}
                  alt={testimonials[mobileIndex].author}
                  className="w-10 h-10 rounded-full object-cover border-2 border-orange"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-navy text-white flex items-center justify-center font-bold text-base">
                  {testimonials[mobileIndex]?.author?.charAt(0) || "U"}
                </div>
              )}
              <div>
                <h4 className="font-heading font-bold text-navy text-sm">
                  {testimonials[mobileIndex]?.author}
                </h4>
                <p className="text-xs text-gray-500 font-medium">
                  {testimonials[mobileIndex]?.role || "Satisfied Client"}
                </p>
              </div>
            </div>
          </div>

          {/* Carousel controls for mobile */}
          {testimonials.length > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={handlePrevMobile}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 text-navy flex items-center justify-center shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-xs text-gray-500 font-semibold">
                {mobileIndex + 1} / {testimonials.length}
              </span>
              <button
                onClick={handleNextMobile}
                className="w-10 h-10 rounded-full bg-white border border-gray-200 text-navy flex items-center justify-center shadow-sm"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
