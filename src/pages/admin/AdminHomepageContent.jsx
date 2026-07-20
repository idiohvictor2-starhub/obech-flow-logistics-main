import React, { useState, useEffect } from "react";
import {
  Sliders,
  MessageSquareQuote,
  BarChart2,
  Phone,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Upload,
  Star,
  CheckCircle,
  Image as ImageIcon,
  Edit2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { getCmsData, saveCmsData } from "@/utils/cmsStorage";

export default function AdminHomepageContent() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("hero"); // "hero" | "testimonials" | "content"

  const [cms, setCms] = useState({
    slides: [],
    testimonials: [],
    stats: [],
    cta: {},
    settings: {},
  });

  const [editingSlide, setEditingSlide] = useState(null);
  const [editingTestimonial, setEditingTestimonial] = useState(null);

  useEffect(() => {
    const data = getCmsData();
    setCms(data);
  }, []);

  const handleSaveAll = (updatedData) => {
    const next = { ...cms, ...updatedData };
    setCms(next);
    saveCmsData(next);
    toast({
      title: "Content Saved Successfully!",
      description: "Homepage content updated and published live.",
    });
  };

  /* ------------------- HERO SLIDER ACTIONS ------------------- */
  const handleUpdateSlide = (slideId, field, value) => {
    const newSlides = cms.slides.map((s) =>
      s.id === slideId ? { ...s, [field]: value } : s
    );
    handleSaveAll({ slides: newSlides });
  };

  const handleSlideImageUpload = (slideId, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result;
      if (base64) {
        handleUpdateSlide(slideId, "bgImage", base64);
        toast({
          title: "Image Uploaded",
          description: "Slide background image replaced successfully.",
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSlide = () => {
    const newId = "slide-" + Date.now();
    const newSlide = {
      id: newId,
      bgImage: cms.slides[0]?.bgImage || "",
      heading: "New Logistics Solution",
      subheading: "Custom shipping & freight services connecting global markets.",
      primaryBtnText: "Get a Quote",
      primaryBtnLink: "#quote-section",
      secondaryBtnText: "Contact Us",
      secondaryBtnLink: "/contact",
    };
    handleSaveAll({ slides: [...cms.slides, newSlide] });
  };

  const handleDeleteSlide = (slideId) => {
    if (cms.slides.length <= 1) {
      toast({
        title: "Action Denied",
        description: "Must keep at least one slide in the hero slider.",
        variant: "destructive",
      });
      return;
    }
    const filtered = cms.slides.filter((s) => s.id !== slideId);
    handleSaveAll({ slides: filtered });
  };

  /* ------------------- TESTIMONIALS ACTIONS ------------------- */
  const handleAddTestimonial = () => {
    const newId = "testi-" + Date.now();
    const newTestimonial = {
      id: newId,
      rating: 5,
      quote: "Excellent cargo handling and on-time delivery!",
      author: "New Client Name",
      role: "Verified Customer",
      avatar: "",
      order: cms.testimonials.length + 1,
    };
    handleSaveAll({ testimonials: [...cms.testimonials, newTestimonial] });
    setEditingTestimonial(newTestimonial.id);
  };

  const handleUpdateTestimonial = (id, field, value) => {
    const updated = cms.testimonials.map((t) =>
      t.id === id ? { ...t, [field]: value } : t
    );
    handleSaveAll({ testimonials: updated });
  };

  const handleDeleteTestimonial = (id) => {
    const filtered = cms.testimonials.filter((t) => t.id !== id);
    handleSaveAll({ testimonials: filtered });
  };

  const handleMoveTestimonial = (index, direction) => {
    const list = [...cms.testimonials];
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIdx];
    list[targetIdx] = temp;

    // re-index order
    const reordered = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    handleSaveAll({ testimonials: reordered });
  };

  const handleAvatarUpload = (id, event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result;
      if (base64) {
        handleUpdateTestimonial(id, "avatar", base64);
      }
    };
    reader.readAsDataURL(file);
  };

  /* ------------------- SITE CONTENT & STATS ACTIONS ------------------- */
  const handleUpdateStat = (id, field, value) => {
    const updatedStats = cms.stats.map((st) =>
      st.id === id ? { ...st, [field]: value } : st
    );
    handleSaveAll({ stats: updatedStats });
  };

  const handleUpdateCta = (field, value) => {
    const updatedCta = { ...cms.cta, [field]: value };
    handleSaveAll({ cta: updatedCta });
  };

  const handleUpdateSettings = (field, value) => {
    const updatedSettings = { ...cms.settings, [field]: value };
    handleSaveAll({ settings: updatedSettings });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-heading font-extrabold text-navy">
            Homepage Content Management
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your Hero Slider, Testimonials, Statistics, and WhatsApp details without code modifications.
          </p>
        </div>
        <button
          onClick={() => handleSaveAll(cms)}
          className="flex items-center gap-2 px-6 py-2.5 bg-orange text-white font-semibold rounded-lg hover:bg-orange-light transition-all shadow-md text-sm self-start md:self-auto"
        >
          <Save size={18} /> Save All Changes
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-gray-200 mb-8 overflow-x-auto">
        <button
          onClick={() => setActiveTab("hero")}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${
            activeTab === "hero"
              ? "border-orange text-orange"
              : "border-transparent text-gray-600 hover:text-navy"
          }`}
        >
          <Sliders size={18} /> Hero Slider ({cms.slides.length})
        </button>

        <button
          onClick={() => setActiveTab("testimonials")}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${
            activeTab === "testimonials"
              ? "border-orange text-orange"
              : "border-transparent text-gray-600 hover:text-navy"
          }`}
        >
          <MessageSquareQuote size={18} /> Testimonials ({cms.testimonials.length})
        </button>

        <button
          onClick={() => setActiveTab("content")}
          className={`flex items-center gap-2 px-5 py-3 font-semibold text-sm border-b-2 transition-all whitespace-nowrap ${
            activeTab === "content"
              ? "border-orange text-orange"
              : "border-transparent text-gray-600 hover:text-navy"
          }`}
        >
          <BarChart2 size={18} /> Stats, CTA & WhatsApp Settings
        </button>
      </div>

      {/* TAB 1: HERO SLIDER */}
      {activeTab === "hero" && (
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-heading font-bold text-navy">
              Configure Hero Slider Images & Copy
            </h2>
            <button
              onClick={handleAddSlide}
              className="flex items-center gap-2 px-4 py-2 bg-navy text-white text-xs font-semibold rounded-lg hover:bg-navy-light transition-all"
            >
              <Plus size={16} /> Add New Slide
            </button>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {cms.slides.map((slide, idx) => (
              <div
                key={slide.id || idx}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-6"
              >
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-orange/10 text-orange font-bold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h3 className="font-heading font-bold text-navy text-base">
                      Slide #{idx + 1}: {slide.heading}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleDeleteSlide(slide.id)}
                    className="text-red-500 hover:text-red-700 p-2 rounded hover:bg-red-50 text-xs flex items-center gap-1 font-medium"
                  >
                    <Trash2 size={16} /> Remove Slide
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left image box */}
                  <div className="lg:col-span-4">
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                      Slide Background Image
                    </label>
                    <div className="relative rounded-lg overflow-hidden border border-gray-200 h-44 bg-gray-100">
                      {slide.bgImage ? (
                        <img
                          src={slide.bgImage}
                          alt="Slide preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                          <ImageIcon size={32} />
                          <span className="text-xs mt-1">No Image</span>
                        </div>
                      )}
                    </div>

                    <label className="mt-3 flex items-center justify-center gap-2 w-full py-2 px-3 bg-steel/50 hover:bg-steel border border-gray-300 rounded-lg text-xs font-semibold text-navy cursor-pointer transition-colors">
                      <Upload size={14} /> Upload / Replace Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleSlideImageUpload(slide.id, e)}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Right fields */}
                  <div className="lg:col-span-8 space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                        Slide Heading
                      </label>
                      <input
                        type="text"
                        value={slide.heading || ""}
                        onChange={(e) =>
                          handleUpdateSlide(slide.id, "heading", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-navy font-semibold focus:outline-none focus:border-orange"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                        Subheading / Description
                      </label>
                      <textarea
                        rows={2}
                        value={slide.subheading || ""}
                        onChange={(e) =>
                          handleUpdateSlide(slide.id, "subheading", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs text-gray-700 focus:outline-none focus:border-orange"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                          Primary Button Text
                        </label>
                        <input
                          type="text"
                          value={slide.primaryBtnText || ""}
                          onChange={(e) =>
                            handleUpdateSlide(slide.id, "primaryBtnText", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                          Secondary Button Text
                        </label>
                        <input
                          type="text"
                          value={slide.secondaryBtnText || ""}
                          onChange={(e) =>
                            handleUpdateSlide(slide.id, "secondaryBtnText", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: TESTIMONIALS */}
      {activeTab === "testimonials" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-heading font-bold text-navy">
                Manage Client Testimonials
              </h2>
              <p className="text-xs text-gray-500">
                Add, edit, delete, rate (1-5 stars), reorder, or upload customer avatars.
              </p>
            </div>
            <button
              onClick={handleAddTestimonial}
              className="flex items-center gap-2 px-4 py-2 bg-orange text-white text-xs font-semibold rounded-lg hover:bg-orange-light transition-all"
            >
              <Plus size={16} /> Add Testimonial
            </button>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {cms.testimonials.map((item, idx) => (
              <div
                key={item.id}
                className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6 items-start justify-between"
              >
                {/* Avatar upload */}
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-2 border-orange flex items-center justify-center mb-2">
                    {item.avatar ? (
                      <img
                        src={item.avatar}
                        alt={item.author}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-bold text-lg text-navy">
                        {item.author?.charAt(0) || "U"}
                      </span>
                    )}
                  </div>
                  <label className="text-[11px] text-orange hover:underline cursor-pointer font-medium">
                    Upload Avatar
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleAvatarUpload(item.id, e)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Main Testimonial Fields */}
                <div className="flex-1 space-y-4 w-full">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                        Author Name
                      </label>
                      <input
                        type="text"
                        value={item.author || ""}
                        onChange={(e) =>
                          handleUpdateTestimonial(item.id, "author", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs text-navy font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                        Role / Designation
                      </label>
                      <input
                        type="text"
                        value={item.role || ""}
                        onChange={(e) =>
                          handleUpdateTestimonial(item.id, "role", e.target.value)
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Testimonial Quote Text
                    </label>
                    <textarea
                      rows={2}
                      value={item.quote || ""}
                      onChange={(e) =>
                        handleUpdateTestimonial(item.id, "quote", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs text-gray-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                      Star Rating (1 to 5)
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((starVal) => (
                        <button
                          key={starVal}
                          type="button"
                          onClick={() => handleUpdateTestimonial(item.id, "rating", starVal)}
                          className="p-1 hover:scale-110 transition-transform"
                        >
                          <Star
                            size={20}
                            className={
                              starVal <= (item.rating || 5)
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-300"
                            }
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-navy ml-2">
                        {item.rating || 5} Stars
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reorder and Delete controls */}
                <div className="flex md:flex-col items-center gap-2 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-4 w-full md:w-auto justify-end">
                  <button
                    onClick={() => handleMoveTestimonial(idx, "up")}
                    disabled={idx === 0}
                    className="p-2 border border-gray-200 rounded hover:bg-steel disabled:opacity-30 text-gray-600"
                    title="Move Up"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    onClick={() => handleMoveTestimonial(idx, "down")}
                    disabled={idx === cms.testimonials.length - 1}
                    className="p-2 border border-gray-200 rounded hover:bg-steel disabled:opacity-30 text-gray-600"
                    title="Move Down"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteTestimonial(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded"
                    title="Delete Testimonial"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CONTENT, STATS & SETTINGS */}
      {activeTab === "content" && (
        <div className="space-y-8">
          {/* Statistics Section */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-base font-heading font-bold text-navy flex items-center gap-2">
              <BarChart2 size={18} className="text-orange" /> Animated Statistics Numbers
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {cms.stats.map((st) => (
                <div key={st.id} className="p-4 bg-steel/30 rounded-lg border border-gray-200 space-y-2">
                  <label className="block text-[11px] font-bold uppercase text-gray-600">
                    Label
                  </label>
                  <input
                    type="text"
                    value={st.label || ""}
                    onChange={(e) => handleUpdateStat(st.id, "label", e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-gray-300 rounded text-xs"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] uppercase text-gray-500">Value</label>
                      <input
                        type="number"
                        value={st.value || 0}
                        onChange={(e) => handleUpdateStat(st.id, "value", Number(e.target.value))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase text-gray-500">Suffix</label>
                      <input
                        type="text"
                        value={st.suffix || "+"}
                        onChange={(e) => handleUpdateStat(st.id, "suffix", e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-center"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pre-Footer Call to Action */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-base font-heading font-bold text-navy">
              Pre-Footer CTA Banner Settings
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  CTA Headline
                </label>
                <input
                  type="text"
                  value={cms.cta?.headline || ""}
                  onChange={(e) => handleUpdateCta("headline", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-semibold text-navy"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  CTA Body Text
                </label>
                <textarea
                  rows={2}
                  value={cms.cta?.text || ""}
                  onChange={(e) => handleUpdateCta("text", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs text-gray-700"
                />
              </div>
            </div>
          </div>

          {/* WhatsApp & Company Contact */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h2 className="text-base font-heading font-bold text-navy flex items-center gap-2">
              <Phone size={18} className="text-emerald-500" /> WhatsApp & Contact Numbers
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Company WhatsApp Number
                </label>
                <input
                  type="text"
                  value={cms.settings?.whatsappNumber || ""}
                  onChange={(e) => handleUpdateSettings("whatsappNumber", e.target.value)}
                  placeholder="+2349066755440"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs font-medium"
                />
                <span className="text-[11px] text-gray-500 mt-1 block">
                  Used for direct "Chat on WhatsApp" quote button and footer contact link.
                </span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">
                  Contact Phone
                </label>
                <input
                  type="text"
                  value={cms.settings?.contactPhone || ""}
                  onChange={(e) => handleUpdateSettings("contactPhone", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs font-medium"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
