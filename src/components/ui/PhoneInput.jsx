import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, Search } from "lucide-react";
import { COUNTRIES } from "@/data/countries";

export default function PhoneInput({
  phone,
  dialCode,
  onPhoneChange,
  onDialCodeChange,
  required = false,
  error = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  const selectedCountry = COUNTRIES.find((c) => c.dialCode === dialCode) || COUNTRIES.find((c) => c.code === "NG") || COUNTRIES[0];

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
        Phone Number {required && <span className="text-orange">*</span>}
      </label>

      <div className="flex items-center gap-2">
        {/* Dial Code Selector */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="h-[46px] px-3 bg-navy border border-white/15 rounded-lg text-white text-xs font-medium flex items-center gap-1.5 hover:border-orange transition-colors focus:outline-none shrink-0"
          >
            <span className="text-base">{selectedCountry.flag}</span>
            <span className="font-mono text-white/90">{selectedCountry.dialCode}</span>
            <ChevronDown size={14} className="text-white/60" />
          </button>

          {isOpen && (
            <div className="absolute left-0 top-full mt-1.5 z-50 bg-navy-light border border-white/20 rounded-xl shadow-2xl overflow-hidden w-64 max-h-64 flex flex-col">
              <div className="p-2 border-b border-white/10 bg-navy">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search dial code..."
                  autoFocus
                  className="w-full px-2.5 py-1.5 bg-white/5 border border-white/10 rounded text-xs text-white placeholder-white/40 focus:outline-none focus:border-orange"
                />
              </div>

              <div className="overflow-y-auto flex-1 divide-y divide-white/5 custom-scrollbar">
                {filteredCountries.map((c) => (
                  <button
                    key={`${c.code}-${c.dialCode}`}
                    type="button"
                    onClick={() => {
                      onDialCodeChange(c.dialCode);
                      setIsOpen(false);
                      setSearch("");
                    }}
                    className="w-full px-3 py-2 text-left text-xs text-white flex items-center justify-between hover:bg-orange/20 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{c.flag}</span>
                      <span className="truncate max-w-[110px]">{c.name}</span>
                    </div>
                    <span className="font-mono text-orange text-[11px] font-bold">{c.dialCode}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Number Field */}
        <input
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="800 000 0000"
          required={required}
          className={`h-[46px] flex-1 px-4 bg-navy border ${
            error ? "border-red-500" : "border-white/15"
          } rounded-lg text-white text-sm placeholder-white/40 focus:outline-none focus:border-orange transition-colors`}
        />
      </div>

      {error && <span className="text-xs text-red-400 mt-1 block">{error}</span>}
    </div>
  );
}
