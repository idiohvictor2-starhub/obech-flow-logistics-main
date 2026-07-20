import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, ArrowUpRight, Linkedin, Twitter, Facebook, Instagram, PlayCircle, MessageCircle } from "lucide-react";
import { getCmsData } from "@/utils/cmsStorage";

const QUICK_LINKS = [
  { label: "Home", path: "/" },
  { label: "About Us", path: "/about" },
  { label: "Track Shipment", path: "/track" },
  { label: "Get a Quote", path: "/quote" },
  { label: "Contact", path: "/contact" },
  { label: "Admin Portal", path: "/admin" },
];

const SERVICES_LINKS = [
  { label: "International Shipping", path: "/services" },
  { label: "Air Freight (Flagship)", path: "/services" },
  { label: "Sea Freight", path: "/services" },
  { label: "Customs Clearance", path: "/services" },
  { label: "Track Shipment", path: "/track" },
];

const SOCIALS = [
  { icon: Instagram, href: "https://www.instagram.com/obechlogistics/", label: "Instagram" },
  { icon: Facebook, href: "https://web.facebook.com/profile.php?id=61583011853675", label: "Facebook" },
  { icon: Twitter, href: "https://x.com", label: "X" },
  { icon: Linkedin, href: "https://www.linkedin.com", label: "LinkedIn" },
  { icon: PlayCircle, href: "https://www.tiktok.com/@obech.logistics", label: "TikTok" },
];

export default function Footer() {
  const [whatsappNumber, setWhatsappNumber] = useState("+2349066755440");

  useEffect(() => {
    const cms = getCmsData();
    if (cms?.settings?.whatsappNumber) {
      setWhatsappNumber(cms.settings.whatsappNumber);
    }
  }, []);

  const cleanWaNumber = whatsappNumber.replace(/[^0-9]/g, "");

  return (
    <footer className="bg-navy text-white">
      {/* Top CTA Banner */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl lg:text-3xl font-heading font-bold">
              Ready to ship cargo internationally?
            </h3>
            <p className="text-white/60 mt-2 text-sm">
              Get a fast, transparent quote or speak directly with our global air freight specialist.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#quote-section"
              className="flex items-center gap-2 px-7 py-3 bg-orange text-white font-semibold uppercase tracking-wider text-xs sm:text-sm rounded hover:bg-orange-light transition-all shadow-md"
            >
              Get a Quote <ArrowUpRight size={16} />
            </a>
            <a
              href={`https://wa.me/${cleanWaNumber}?text=Hello%20Obech%20Logistics,%20I%20need%20assistance%20with%20a%20shipment.`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white font-semibold text-xs sm:text-sm rounded hover:bg-emerald-500 transition-all shadow-md"
            >
              <MessageCircle size={16} /> WhatsApp Us
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand & logo */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Link to="/" className="flex items-center gap-3 group">
                <img
                  src="/logo.png"
                  alt="Obech Logo"
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <span className="font-heading font-bold text-lg text-white">OBECH</span>
                  <span className="font-heading font-bold text-lg text-orange ml-1">GLOBAL</span>
                </div>
              </Link>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              World-class international logistics, air freight forwarding, sea freight, customs clearance, and door-to-door cargo delivery connecting businesses across continents.
            </p>
            <div className="flex gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="w-9 h-9 rounded border border-white/10 flex items-center justify-center text-white/40 hover:text-orange hover:border-orange/50 transition-all"
                >
                  <s.icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-orange mb-6">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.path}
                    className="text-sm text-white/50 hover:text-white hover:translate-x-1 transition-all inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Logistics Services */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-orange mb-6">
              International Services
            </h4>
            <ul className="space-y-3">
              {SERVICES_LINKS.map((service) => (
                <li key={service.label}>
                  <Link
                    to={service.path}
                    className="text-sm text-white/50 hover:text-white hover:translate-x-1 transition-all inline-block"
                  >
                    {service.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-orange mb-6">
              Contact & WhatsApp
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-orange mt-1 shrink-0" />
                <div className="flex flex-col gap-2 text-sm text-white/50">
                  <a
                    href="https://maps.google.com/?q=21+road+opposite+I+close,+Festac+town,+Lagos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    <strong className="text-white">Main Office:</strong><br />
                    21 road opposite I close, Festac town, Lagos
                  </a>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-orange shrink-0" />
                <a href="tel:+2349066755440" className="text-sm text-white/50 hover:text-white transition-colors">
                  +234 906 675 5440
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MessageCircle size={16} className="text-emerald-400 shrink-0" />
                <a
                  href={`https://wa.me/${cleanWaNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-emerald-400 font-medium hover:underline"
                >
                  WhatsApp: {whatsappNumber}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-orange mt-0.5 shrink-0" />
                <div className="flex flex-col text-sm text-white/50 break-all">
                  <a href="mailto:info@obechlogistics.com" className="hover:text-white transition-colors">
                    info@obechlogistics.com
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Legal Bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} Obech Global Logistics. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/about" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/about" className="text-xs text-white/30 hover:text-white/60 transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}