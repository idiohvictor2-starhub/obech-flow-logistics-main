import React, { useState, useEffect } from "react";
import { Image, Save, RotateCcw, AlertCircle, Link2, Check, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getPhotoUrl, setPhotoUrl, resetPhotos, DEFAULT_PHOTOS, PRESETS } from "@/utils/photoStorage";

const PHOTO_CONFIG = [
  {
    key: "hero_bg",
    title: "Hero Background Image",
    desc: "Background image for the landing page Hero section.",
    location: "Home page Header"
  },
  {
    key: "why_us",
    title: "Why Choose Us Side Image",
    desc: "Side graphic illustrating modern cargo shipping and logistics.",
    location: "Home page Why Choose Us section"
  },
  {
    key: "service_bike",
    title: "Bike Dispatch Image",
    desc: "Image used for Bike Dispatch logistics services and modes.",
    location: "Services page & Home page Modes section"
  },
  {
    key: "service_van",
    title: "Van Delivery Image",
    desc: "Image used for medium parcel cargo van delivery.",
    location: "Services page & Home page Modes section"
  },
  {
    key: "service_truck",
    title: "Truck Logistics Image",
    desc: "Image used for bulk heavy-duty cargo haulage.",
    location: "Services page & Home page Modes section"
  },
  {
    key: "service_business",
    title: "Business Support Image",
    desc: "Image used for forklift and warehouse commercial logistics support.",
    location: "Services page details"
  }
];

export default function AdminPhotos() {
  const { toast } = useToast();
  const [urls, setUrls] = useState({});

  // Load photos on mount
  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = () => {
    const loaded = {};
    PHOTO_CONFIG.forEach((cfg) => {
      loaded[cfg.key] = getPhotoUrl(cfg.key);
    });
    setUrls(loaded);
  };

  const handleUrlChange = (key, val) => {
    setUrls((prev) => ({ ...prev, [key]: val }));
  };

  const handleUpdate = (key) => {
    const url = urls[key];
    if (!url || !url.trim().startsWith("http")) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid HTTP or HTTPS image link.",
        variant: "destructive"
      });
      return;
    }
    setPhotoUrl(key, url.trim());
    toast({
      title: "Photo Updated",
      description: "The photo link has been saved and is now active across the website."
    });
  };

  const handleResetIndividual = (key) => {
    const defaultUrl = DEFAULT_PHOTOS[key];
    handleUrlChange(key, defaultUrl);
    setPhotoUrl(key, defaultUrl);
    toast({
      title: "Reset Completed",
      description: "Restored the default high-quality Unsplash image."
    });
  };

  const handleResetAll = () => {
    resetPhotos();
    loadPhotos();
    toast({
      title: "All Photos Reset",
      description: "All application images have been restored to their factory defaults."
    });
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-black text-navy">Media Library & Links</h1>
          <p className="text-muted-foreground mt-1">
            Restructure and re-link graphics across the home and service pages.
          </p>
        </div>
        <button
          onClick={handleResetAll}
          className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 border-2 border-orange/20 text-orange font-bold text-xs uppercase tracking-wider rounded-lg hover:border-orange hover:bg-orange/5 transition-all"
        >
          <RotateCcw size={14} />
          Reset All Defaults
        </button>
      </div>

      {/* Info Alert */}
      <div className="bg-orange/10 border border-orange/20 rounded-xl p-4 flex gap-3 text-navy text-sm">
        <AlertCircle size={20} className="text-orange shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Pro-tip for image editing:</span> Paste any direct URL to a photo (e.g. from Unsplash, Imgur, or your corporate server) and click <span className="font-bold">Update</span>. You can also pick from our preset high-end logistics photos by clicking the <span className="font-bold">Preset buttons</span> inside each card.
        </div>
      </div>

      {/* Grid of photo edit cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {PHOTO_CONFIG.map((cfg) => {
          const currentUrl = urls[cfg.key] || "";
          const isCustom = currentUrl !== DEFAULT_PHOTOS[cfg.key];
          const presets = PRESETS[cfg.key] || [];

          return (
            <div
              key={cfg.key}
              className="bg-white rounded-2xl border border-steel overflow-hidden shadow-sm flex flex-col hover:border-orange/20 transition-all group"
            >
              {/* Image Preview Container */}
              <div className="relative h-48 bg-steel/30 overflow-hidden shrink-0 border-b border-steel">
                {currentUrl ? (
                  <img
                    src={currentUrl}
                    alt={cfg.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://images.unsplash.com/photo-1594818821905-183685f70285?auto=format&fit=crop&w=800&q=60";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-semibold gap-2">
                    <Image size={20} className="text-muted-foreground/50" />
                    No Image Link Specified
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="px-2.5 py-1 bg-navy/80 backdrop-blur-md rounded text-[10px] uppercase tracking-widest font-mono text-white/90">
                    {cfg.location}
                  </span>
                </div>
                {isCustom && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-0.5 bg-orange text-white rounded text-[9px] uppercase tracking-wider font-semibold font-mono flex items-center gap-1 shadow-sm">
                      <Sparkles size={8} /> Customized
                    </span>
                  </div>
                )}
              </div>

              {/* Form details */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-base font-heading font-bold text-navy">{cfg.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{cfg.desc}</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1">
                      <Link2 size={10} className="text-orange" /> Direct Photo Link (URL)
                    </label>
                    <input
                      type="text"
                      value={currentUrl}
                      onChange={(e) => handleUrlChange(cfg.key, e.target.value)}
                      placeholder="https://images.unsplash.com/photo-..."
                      className="w-full border border-steel rounded-lg px-3 py-2 text-xs font-mono text-navy focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange"
                    />
                  </div>

                  {/* Preset Selector buttons */}
                  {presets.length > 0 && (
                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                        High-quality Preset Graphics
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {presets.map((preset) => {
                          const isSelected = currentUrl === preset.url;
                          return (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => handleUrlChange(cfg.key, preset.url)}
                              className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all flex items-center gap-1 border ${
                                isSelected
                                  ? "bg-navy text-white border-navy"
                                  : "bg-steel/30 text-navy hover:bg-steel/60 border-steel"
                              }`}
                            >
                              {isSelected && <Check size={10} className="text-orange" />}
                              {preset.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions row */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleUpdate(cfg.key)}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-orange text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-orange-light transition-all shadow-sm"
                  >
                    <Save size={12} />
                    Update Link
                  </button>
                  <button
                    onClick={() => handleResetIndividual(cfg.key)}
                    disabled={!isCustom}
                    className="px-3.5 border border-steel rounded-lg text-muted-foreground hover:text-navy hover:bg-steel/30 transition-all disabled:opacity-30 disabled:pointer-events-none"
                    title="Reset to default Unsplash URL"
                  >
                    <RotateCcw size={12} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
