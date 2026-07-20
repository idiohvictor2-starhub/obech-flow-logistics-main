import React, { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, Check, Globe } from "lucide-react";
import { COUNTRIES } from "@/data/countries";

export default function CountrySelect({
  value,
  onChange,
  placeholder = "Select Country",
  label = "Country",
  required = false,
  error = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef(null);

  // Find currently selected country by code or name
  const selectedCountry = COUNTRIES.find(
    (c) =>
      c.code.toLowerCase() === (value || "").toLowerCase() ||
      c.name.toLowerCase() === (value || "").toLowerCase()
  );

  // Filter countries based on search-as-you-type query
  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.dialCode.includes(search)
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (country) => {
    onChange(country);
    setIsOpen(false);
    setSearch("");
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {label && (
        <label className="block text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
          {label} {required && <span className="text-orange">*</span>}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-3 bg-navy border ${
          error ? "border-red-500" : isOpen ? "border-orange" : "border-white/15"
        } rounded-lg text-white text-sm flex items-center justify-between transition-colors focus:outline-none`}
      >
        {selectedCountry ? (
          <div className="flex items-center gap-2.5 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="text-lg leading-none">{selectedCountry.flag}</span>
            <span className="font-medium">{selectedCountry.name}</span>
            <span className="text-[10px] bg-white/10 text-orange font-bold px-1.5 py-0.5 rounded ml-1">
              {selectedCountry.code}
            </span>
          </div>
        ) : (
          <span className="text-white/40 flex items-center gap-2">
            <Globe size={16} /> {placeholder}
          </span>
        )}
        <ChevronDown size={16} className={`text-white/60 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Popover */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-navy-light border border-white/20 rounded-xl shadow-2xl overflow-hidden max-h-72 flex flex-col">
          {/* Search-as-you-type Input */}
          <div className="p-2.5 border-b border-white/10 bg-navy sticky top-0 z-10">
            <div className="relative flex items-center">
              <Search size={16} className="absolute left-3 text-white/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Type to filter e.g. Nig, Can, Uni..."
                autoFocus
                className="w-full pl-9 pr-3 py-2 bg-white/5 border border-white/10 rounded-md text-xs text-white placeholder-white/40 focus:outline-none focus:border-orange"
              />
            </div>
          </div>

          {/* Country List Options */}
          <div className="overflow-y-auto flex-1 divide-y divide-white/5 custom-scrollbar">
            {filteredCountries.length > 0 ? (
              filteredCountries.map((c) => {
                const isSelected = selectedCountry?.code === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleSelect(c)}
                    className={`w-full px-4 py-2.5 text-left text-xs text-white flex items-center justify-between hover:bg-orange/20 transition-colors ${
                      isSelected ? "bg-orange/30 font-bold text-orange" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-base">{c.flag}</span>
                      <span>{c.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-white/40 font-mono">{c.code}</span>
                      {isSelected && <Check size={14} className="text-orange" />}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-white/50">
                No matching country found.
              </div>
            )}
          </div>
        </div>
      )}

      {error && <span className="text-xs text-red-400 mt-1 block">{error}</span>}
    </div>
  );
}
