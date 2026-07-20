import React, { useState, useEffect, useRef } from "react";
import { Globe, PackageCheck, CalendarCheck, Users } from "lucide-react";
import { getCmsData } from "@/utils/cmsStorage";

const STAT_ICONS = [Globe, PackageCheck, CalendarCheck, Users];

export default function StatsCounter() {
  const [stats, setStats] = useState([]);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const cms = getCmsData();
    if (cms?.stats) {
      setStats(cms.stats);
    }

    const handleCmsUpdate = (e) => {
      if (e.detail?.stats) {
        setStats(e.detail.stats);
      }
    };
    window.addEventListener("obech_cms_updated", handleCmsUpdate);
    return () => window.removeEventListener("obech_cms_updated", handleCmsUpdate);
  }, []);

  // Intersection observer to trigger counter animation when scrolled into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="py-16 bg-navy text-white border-y border-white/10 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((item, idx) => {
            const IconComponent = STAT_ICONS[idx % STAT_ICONS.length] || Globe;
            return (
              <div key={item.id || idx} className="p-4 flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-orange/15 text-orange flex items-center justify-center mb-4">
                  <IconComponent size={26} />
                </div>
                <div className="text-3xl sm:text-4xl lg:text-5xl font-heading font-extrabold text-white tracking-tight mb-2">
                  <AnimatedNumber target={item.value} isVisible={isVisible} />
                  <span className="text-orange">{item.suffix || "+"}</span>
                </div>
                <div className="text-xs sm:text-sm text-white/70 font-semibold uppercase tracking-wider">
                  {item.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function AnimatedNumber({ target, isVisible }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let start = 0;
    const end = parseInt(target, 10) || 0;
    if (end === 0) {
      setCount(0);
      return;
    }

    const duration = 2000; // 2 seconds
    const frameTime = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameTime);
    const increment = end / totalFrames;

    let currentFrame = 0;
    const timer = setInterval(() => {
      currentFrame++;
      start += increment;
      if (currentFrame >= totalFrames) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, frameTime);

    return () => clearInterval(timer);
  }, [target, isVisible]);

  return <span>{count.toLocaleString()}</span>;
}
