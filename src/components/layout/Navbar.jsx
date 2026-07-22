import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getCmsData } from "@/utils/cmsStorage";

const NAV_LINKS = [
  { label: "Home", path: "/" },
  { label: "Services", path: "/services" },
  { label: "Tracking", path: "/track" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
  { label: "Admin Portal", path: "/admin" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [siteName, setSiteName] = useState("Obech Global Logistics");
  const location = useLocation();

  useEffect(() => {
    // Load initial settings name
    const cms = getCmsData();
    if (cms?.settings?.siteName) {
      setSiteName(cms.settings.siteName);
    }

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);

    const handleCmsUpdate = (e) => {
      if (e.detail?.settings?.siteName) {
        setSiteName(e.detail.settings.siteName);
      }
    };
    window.addEventListener("obech_cms_updated", handleCmsUpdate);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("obech_cms_updated", handleCmsUpdate);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const isHome = location.pathname === "/";
  const navBg = scrolled || !isHome
    ? "bg-navy shadow-lg shadow-navy/10"
    : "bg-transparent";

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="Obech Logo"
              className="w-10 h-10 object-contain"
            />
            <span className="text-white font-heading font-black text-lg sm:text-xl tracking-tight group-hover:text-orange transition-colors">
              {siteName}
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 text-sm font-medium tracking-wide uppercase transition-all duration-200 hover:translate-x-1 ${
                  location.pathname === link.path
                    ? "text-orange"
                    : "text-white/80 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
            <Link
              to="/quote"
              className="ml-4 px-6 py-2.5 bg-orange text-white text-sm font-semibold uppercase tracking-wider rounded hover:bg-orange-light transition-all duration-200 shadow-md flex items-center gap-2"
            >
              Get a Quote
            </Link>
          </div>

          {/* Mobile Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden text-white p-2"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-navy border-t border-white/10 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium uppercase tracking-wide transition-all ${
                    location.pathname === link.path
                      ? "text-orange bg-white/5"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                  <ChevronRight size={16} className="opacity-40" />
                </Link>
              ))}
              <Link
                to="/quote"
                className="block mt-3 px-4 py-3 bg-orange text-white text-sm font-semibold uppercase tracking-wider rounded-lg text-center shadow-md"
              >
                Get a Quote
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}