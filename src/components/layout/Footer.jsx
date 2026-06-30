import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, ArrowUpRight, Linkedin, Twitter, Facebook, Instagram } from "lucide-react";

const QUICK_LINKS = [
  { label: "Home", path: "/" },
  { label: "About Us", path: "/about" },
  { label: "Track Shipment", path: "/tracking" },
  { label: "Request Quote", path: "/quote" },
  { label: "Contact", path: "/contact" },
];

const SERVICES = [
  "Air Freight",
  "Ocean Freight",
  "Door-to-Door DDP",
  "Customs Clearance",
  "Warehousing",
  "Business Shipping",
];

const SOCIALS = [
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Twitter, href: "https://twitter.com", label: "Twitter" },
  { icon: Facebook, href: "https://facebook.com", label: "Facebook" },
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
];

export default function Footer() {
  return (
    <footer className="bg-navy text-white">
      {/* CTA Banner */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl lg:text-3xl font-heading font-bold">
              Ready to move your cargo?
            </h3>
            <p className="text-white/60 mt-2 text-sm">
              Get a competitive quote for your next shipment in minutes.
            </p>
          </div>
          <Link
            to="/booking"
            className="flex items-center gap-2 px-8 py-3.5 bg-orange text-white font-semibold uppercase tracking-wider text-sm rounded hover:bg-orange-light transition-all hover:translate-x-1"
          >
            Book a Delivery <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-orange rounded-lg flex items-center justify-center font-heading font-black text-white text-lg">
                OG
              </div>
              <div>
                <span className="font-heading font-bold text-lg">OBECH</span>
                <span className="font-heading font-bold text-lg text-orange ml-1">GLOBAL</span>
              </div>
            </div>
            <p className="text-white/50 text-sm leading-relaxed mb-6">
              Smart global logistics, freight forwarding, customs clearance, and door-to-door delivery for African businesses trading with the world.
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
                <li key={link.path}>
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

          {/* Services */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-orange mb-6">
              Services
            </h4>
            <ul className="space-y-3">
              {SERVICES.map((service) => (
                <li key={service}>
                  <Link
                    to="/services"
                    className="text-sm text-white/50 hover:text-white hover:translate-x-1 transition-all inline-block"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-orange mb-6">
              Contact Us
            </h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={16} className="text-orange mt-0.5 shrink-0" />
                <span className="text-sm text-white/50">Lagos, Nigeria</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={16} className="text-orange mt-0.5 shrink-0" />
                <a href="tel:+234XXXXXXXX" className="text-sm text-white/50 hover:text-white transition-colors">
                  +234 XXX XXX XXXX
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={16} className="text-orange mt-0.5 shrink-0" />
                <a href="mailto:info@obechgloballogistics.com" className="text-sm text-white/50 hover:text-white transition-colors break-all">
                  info@obechgloballogistics.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
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
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}