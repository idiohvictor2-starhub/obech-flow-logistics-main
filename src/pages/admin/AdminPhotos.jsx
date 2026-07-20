import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  Check,
  Image,
  Link2,
  Loader2,
  RotateCcw,
  Save,
  Sparkles,
  Upload,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import {
  DEFAULT_PHOTOS,
  PRESETS,
  getPhotoUrl,
  loadSitePhotos,
  resetAllSitePhotos,
  resetSitePhoto,
  saveSitePhotoLink,
  uploadSitePhoto,
} from "@/utils/photoStorage";

const PHOTO_CONFIG = [
  {
    key: "hero_air_freight_1",
    title: "Global Air Freight Hero Banner",
    desc: "Primary flagship hero banner image featuring Boeing cargo aircraft on airport runway.",
    location: "Homepage Hero Slide 1 & Air Freight Section",
  },
  {
    key: "hero_cargo_loading_2",
    title: "Fast Cargo Handling & Loading Image",
    desc: "Hero banner image featuring air cargo pallets & tarmac loading operations.",
    location: "Homepage Hero Slide 2",
  },
  {
    key: "hero_seaport_warehouse_3",
    title: "Ocean & Sea Freight Seaport Image",
    desc: "Hero banner and service image featuring seaport cranes & container terminal.",
    location: "Homepage Hero Slide 3 & Sea Freight Section",
  },
  {
    key: "why_us",
    title: "Why Choose Us Side Graphic",
    desc: "Side graphic illustrating international freight network and global trade.",
    location: "Homepage Why Choose Us section",
  },
];

const getInitialUrls = () => Object.fromEntries(
  PHOTO_CONFIG.map(({ key }) => [key, getPhotoUrl(key)])
);

export default function AdminPhotos() {
  const { toast } = useToast();
  const [urls, setUrls] = useState(getInitialUrls);
  const [records, setRecords] = useState({});
  const [loading, setLoading] = useState(true);
  const [busyAction, setBusyAction] = useState(null);

  const loadPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const loadedRecords = await loadSitePhotos();
      setRecords(loadedRecords);
      setUrls(Object.fromEntries(
        PHOTO_CONFIG.map(({ key }) => [
          key,
          loadedRecords[key]?.image_url || getPhotoUrl(key),
        ])
      ));
    } catch (error) {
      toast({
        title: "Media library unavailable",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadPhotos();
  }, [loadPhotos]);

  const updateRecord = (key, record) => {
    setRecords((current) => ({ ...current, [key]: record }));
    setUrls((current) => ({ ...current, [key]: record.image_url }));
  };

  const clearRecord = (key) => {
    setRecords((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
    setUrls((current) => ({ ...current, [key]: DEFAULT_PHOTOS[key] }));
  };

  const handleUrlChange = (key, value) => {
    setUrls((current) => ({ ...current, [key]: value }));
  };

  const handleFileUpload = async (key, file) => {
    if (!file) return;

    setBusyAction({ key, type: "upload" });
    try {
      const record = await uploadSitePhoto(
        key,
        file,
        records[key]?.storage_path
      );
      updateRecord(key, record);
      toast({
        title: "Photo uploaded",
        description: "The gallery photo is now live across the public website.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setBusyAction(null);
    }
  };

  const handleSaveLink = async (key) => {
    setBusyAction({ key, type: "link" });
    try {
      const record = await saveSitePhotoLink(
        key,
        urls[key]?.trim(),
        records[key]?.storage_path
      );
      updateRecord(key, record);
      toast({
        title: "Photo link saved",
        description: "The linked photo is now live across the public website.",
      });
    } catch (error) {
      toast({
        title: "Photo link not saved",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setBusyAction(null);
    }
  };

  const handleResetIndividual = async (key) => {
    setBusyAction({ key, type: "reset" });
    try {
      await resetSitePhoto(key, records[key]?.storage_path);
      clearRecord(key);
      toast({
        title: "Default restored",
        description: "This website position is using its original photo again.",
      });
    } catch (error) {
      toast({
        title: "Reset failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setBusyAction(null);
    }
  };

  const handleResetAll = async () => {
    const confirmed = window.confirm(
      "Restore all website photos to their original defaults?"
    );
    if (!confirmed) return;

    setBusyAction({ key: "all", type: "reset" });
    try {
      await resetAllSitePhotos();
      setRecords({});
      setUrls(Object.fromEntries(
        PHOTO_CONFIG.map(({ key }) => [key, DEFAULT_PHOTOS[key]])
      ));
      toast({
        title: "All defaults restored",
        description: "Every managed website photo is back to its original image.",
      });
    } catch (error) {
      toast({
        title: "Reset failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setBusyAction(null);
    }
  };

  const isBusy = (key) => busyAction?.key === key;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-heading font-black text-navy">Manage Website Photos</h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Upload custom air & sea freight imagery or save direct image links. Changes update live across the site.
          </p>
        </div>
        <button
          type="button"
          onClick={handleResetAll}
          disabled={Boolean(busyAction) || loading}
          className="self-start sm:self-auto flex items-center gap-2 px-5 py-2.5 border-2 border-orange/20 text-orange font-bold text-xs uppercase tracking-wider rounded-lg hover:border-orange hover:bg-orange/5 transition-all disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busyAction?.key === "all" ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <RotateCcw size={14} />
          )}
          Reset All Defaults
        </button>
      </div>

      <div className="bg-orange/10 border border-orange/20 rounded-xl p-4 flex gap-3 text-navy text-sm">
        <AlertCircle size={20} className="text-orange shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Choose Photo</span> opens your device gallery to upload custom air & sea freight media immediately (JPG, PNG, WebP, AVIF up to 5 MB).
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin text-orange" />
          Loading saved website photos...
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {PHOTO_CONFIG.map((cfg) => {
          const currentUrl = urls[cfg.key] || DEFAULT_PHOTOS[cfg.key];
          const savedRecord = records[cfg.key];
          const savedUrl = savedRecord?.image_url || DEFAULT_PHOTOS[cfg.key];
          const hasUnsavedLink = currentUrl !== savedUrl;
          const presets = PRESETS[cfg.key] || [];
          const cardBusy = isBusy(cfg.key);

          return (
            <div
              key={cfg.key}
              className="bg-white rounded-2xl border border-steel overflow-hidden shadow-sm flex flex-col hover:border-orange/20 transition-all group"
            >
              <div className="relative h-52 bg-steel/30 overflow-hidden shrink-0 border-b border-steel">
                {currentUrl ? (
                  <img
                    src={currentUrl}
                    alt={cfg.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = DEFAULT_PHOTOS[cfg.key];
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs font-semibold gap-2">
                    <Image size={20} className="text-muted-foreground/50" />
                    No image selected
                  </div>
                )}
                <div className="absolute top-4 left-4">
                  <span className="px-2.5 py-1 bg-navy/80 backdrop-blur-md rounded text-[10px] uppercase tracking-widest font-mono text-white/90">
                    {cfg.location}
                  </span>
                </div>
                {savedRecord && (
                  <div className="absolute top-4 right-4">
                    <span className="px-2 py-0.5 bg-orange text-white rounded text-[9px] uppercase tracking-wider font-semibold font-mono flex items-center gap-1 shadow-sm">
                      <Sparkles size={8} />
                      {savedRecord.storage_path ? "Gallery upload" : "Custom link"}
                    </span>
                  </div>
                )}
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-5">
                <div>
                  <h3 className="text-base font-heading font-bold text-navy">{cfg.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{cfg.desc}</p>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <label
                    htmlFor={`photo-upload-${cfg.key}`}
                    className={`flex items-center justify-center gap-2 rounded-lg bg-orange px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm transition-all hover:bg-orange-light ${
                      cardBusy || Boolean(busyAction && !cardBusy)
                        ? "pointer-events-none cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }`}
                  >
                    {busyAction?.key === cfg.key && busyAction.type === "upload" ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Upload size={14} />
                    )}
                    Choose Photo
                    <input
                      id={`photo-upload-${cfg.key}`}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/avif"
                      className="hidden"
                      disabled={Boolean(busyAction)}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";
                        handleFileUpload(cfg.key, file);
                      }}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => handleResetIndividual(cfg.key)}
                    disabled={!savedRecord || Boolean(busyAction)}
                    className="flex items-center justify-center gap-2 rounded-lg border border-steel px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-muted-foreground transition-all hover:bg-steel/30 hover:text-navy disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    {busyAction?.key === cfg.key && busyAction.type === "reset" ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <RotateCcw size={13} />
                    )}
                    Restore Default
                  </button>
                </div>

                <div className="space-y-3 border-t border-steel pt-4">
                  <div>
                    <label className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <Link2 size={10} className="text-orange" /> Direct Photo Link (URL)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={currentUrl}
                        onChange={(event) => handleUrlChange(cfg.key, event.target.value)}
                        placeholder="https://example.com/photo.jpg"
                        disabled={Boolean(busyAction)}
                        className="min-w-0 flex-1 border border-steel rounded-lg px-3 py-2 text-xs font-mono text-navy focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-orange disabled:bg-steel/20"
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveLink(cfg.key)}
                        disabled={!hasUnsavedLink || Boolean(busyAction)}
                        className="flex items-center gap-1.5 rounded-lg bg-navy px-3 py-2 text-xs font-bold uppercase tracking-wider text-white transition-all hover:bg-navy/90 disabled:cursor-not-allowed disabled:opacity-35"
                      >
                        {busyAction?.key === cfg.key && busyAction.type === "link" ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Save size={12} />
                        )}
                        Save
                      </button>
                    </div>
                  </div>

                  {presets.length > 0 && (
                    <div>
                      <span className="block text-[9px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                        Preset Photos
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {presets.map((preset) => {
                          const isSelected = currentUrl === preset.url;
                          return (
                            <button
                              key={preset.label}
                              type="button"
                              onClick={() => handleUrlChange(cfg.key, preset.url)}
                              disabled={Boolean(busyAction)}
                              className={`px-2.5 py-1 rounded text-[10px] font-medium transition-all flex items-center gap-1 border disabled:opacity-50 ${
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
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
