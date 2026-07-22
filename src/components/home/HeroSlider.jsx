import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight, ArrowRight, Plane } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getCmsData } from "@/utils/cmsStorage";

export default function HeroSlider() {
  const [slides, setSlides] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const loadData = useCallback(() => {
    const cms = getCmsData();
    if (cms && cms.slides && cms.slides.length > 0) {
      setSlides(cms.slides);
    }
  }, []);

  useEffect(() => {
    loadData();

    const handleCmsUpdate = (e) => {
      if (e.detail?.slides) {
        setSlides(e.detail.slides);
      }
    };
    window.addEventListener("obech_cms_updated", handleCmsUpdate);
    return () => window.removeEventListener("obech_cms_updated", handleCmsUpdate);
  }, [loadData]);

  // Automatic smooth slide transition every 5 seconds if not hovered
  useEffect(() => {
    if (slides.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides.length, isHovered]);

  if (!slides || slides.length === 0) return null;

  const currentSlide = slides[currentIndex] || slides[0];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const renderButton = (btnText, btnLink, isPrimary) => {
    if (!btnText) return null;

    const isAnchor = btnLink && btnLink.startsWith("#");
    const className = isPrimary
      ? "px-7 py-3.5 bg-orange text-white font-semibold rounded-md hover:bg-orange-light transition-all shadow-lg shadow-orange/30 flex items-center justify-center gap-2 group text-sm sm:text-base cursor-pointer"
      : "px-7 py-3.5 bg-white/10 backdrop-blur-md border border-white/30 text-white font-semibold rounded-md hover:bg-white/20 transition-all flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer";

    if (isAnchor) {
      return (
        <a href={btnLink} className={className}>
          {btnText}
          {isPrimary && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
        </a>
      );
    }

    return (
      <Link to={btnLink || "/quote"} className={className}>
        {btnText}
        {isPrimary && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
      </Link>
    );
  };

  return (
    <section
      className="relative w-full h-[85vh] min-h-[550px] max-h-[750px] bg-navy overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Slides with Overlapping Cross-Fade Transition */}
      <AnimatePresence>
        <motion.div
          key={currentSlide.id || currentIndex}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <img
            src={currentSlide.bgImage}
            alt={currentSlide.heading}
            className="w-full h-full object-cover object-center"
            loading={currentIndex === 0 ? "eager" : "lazy"}
          />
          {/* Layered dark gradients for continuous readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-navy/95 via-navy/80 to-navy/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/50" />
        </motion.div>
      </AnimatePresence>

      {/* Decorative Brand Accent Badges */}
      <div className="absolute top-20 left-4 sm:left-8 z-10 hidden md:flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full text-xs text-white/90">
        <span className="w-2 h-2 rounded-full bg-orange animate-ping" />
        <span className="font-semibold uppercase tracking-wider text-[11px] text-orange">Flagship Service:</span>
        <span>International Air Freight Services</span>
      </div>

      {/* Slide Content */}
      <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-10 flex flex-col justify-center">
        <div className="max-w-2xl text-white pt-12 md:pt-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id || currentIndex}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-orange/20 border border-orange/40 text-orange-light text-xs font-semibold tracking-wider uppercase mb-4">
                <Plane size={14} /> Global Logistics Carrier
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-white leading-tight tracking-tight mb-4 drop-shadow-md">
                {currentSlide.heading}
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-white/80 leading-relaxed mb-8 max-w-xl">
                {currentSlide.subheading}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                {renderButton(currentSlide.primaryBtnText, currentSlide.primaryBtnLink, true)}
                {renderButton(currentSlide.secondaryBtnText, currentSlide.secondaryBtnLink, false)}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Previous Slide"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-orange backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:scale-110"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={handleNext}
            aria-label="Next Slide"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-orange backdrop-blur-md border border-white/20 text-white flex items-center justify-center transition-all hover:scale-110"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Pagination Controls */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 bg-navy/60 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
        {slides.map((s, idx) => (
          <button
            key={s.id || idx}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
            className={`transition-all duration-500 rounded-full ${idx === currentIndex
                ? "w-8 h-2.5 bg-orange"
                : "w-2.5 h-2.5 bg-white/40 hover:bg-white/70"
              }`}
          />
        ))}
      </div>
    </section>
  );
}
