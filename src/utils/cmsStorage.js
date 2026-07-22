import heroAirFreight from '@/assets/images/hero_air_freight_1.png';
import heroCargoLoading from '@/assets/images/hero_cargo_loading_2.png';
import heroSeaportWarehouse from '@/assets/images/hero_seaport_warehouse_3.png';
import { supabase } from '@/lib/supabase';

const CMS_STORAGE_KEY = "obech_cms_content_v1";
const QUOTES_STORAGE_KEY = "obech_quote_requests_v1";
const CMS_ROW_ID = "c0c59e77-1234-5678-abcd-ef1234567890"; // Persistent row ID inside locations table

export const DEFAULT_SLIDES = [
  {
    id: "slide-1",
    bgImage: heroAirFreight,
    heading: "Global Air Freight Solutions",
    subheading: "Fast, secure and reliable international cargo delivery connecting businesses across continents.",
    primaryBtnText: "Get a Quote",
    primaryBtnLink: "#quote-section",
    secondaryBtnText: "Track Shipment",
    secondaryBtnLink: "/track",
  },
  {
    id: "slide-2",
    bgImage: heroCargoLoading,
    heading: "Fast International Cargo Handling",
    subheading: "Professional cargo management from pickup to customs clearance and worldwide delivery.",
    primaryBtnText: "Request Pickup",
    primaryBtnLink: "#quote-section",
    secondaryBtnText: "Contact Us",
    secondaryBtnLink: "/contact",
  },
  {
    id: "slide-3",
    bgImage: heroSeaportWarehouse,
    heading: "End-to-End Global Logistics",
    subheading: "Sea freight, warehousing and international supply chain solutions tailored for your business.",
    primaryBtnText: "Learn More",
    primaryBtnLink: "/about",
    secondaryBtnText: "Get Quote",
    secondaryBtnLink: "#quote-section",
  },
];

export const DEFAULT_TESTIMONIALS = [
  {
    id: "testi-1",
    rating: 5,
    quote: "Obech Logistics is an amazing and reliable platform. Thank you for the seamless pickup and delivery. Looking forward to more transactions.",
    author: "Gbenga Oluremi",
    role: "Verified Client",
    avatar: "",
    order: 1,
  },
  {
    id: "testi-2",
    rating: 5,
    quote: "I heard about Obech Global Logistics and sent a customer's parcel through them. The experience was delightful as the package was delivered even before the promised delivery date.",
    author: "Farida Muhammad",
    role: "E-Commerce Business Owner",
    avatar: "",
    order: 2,
  },
];

export const DEFAULT_STATS = [
  { id: "stat-1", label: "Countries Served", value: 120, suffix: "+" },
  { id: "stat-2", label: "Shipments Delivered", value: 50000, suffix: "+" },
  { id: "stat-3", label: "Years of Experience", value: 10, suffix: "+" },
  { id: "stat-4", label: "Happy Clients", value: 5000, suffix: "+" },
];

export const DEFAULT_CTA = {
  headline: "Ready to Ship Worldwide?",
  text: "Let Obech Global Logistics move your cargo safely, quickly and professionally across the globe.",
  primaryBtnText: "Get a Quote",
  primaryBtnLink: "#quote-section",
  secondaryBtnText: "Contact Us",
  secondaryBtnLink: "/contact",
};

export const DEFAULT_SETTINGS = {
  siteName: "Obech Global Logistics",
  whatsappNumber: "+2349066755440",
  contactPhone: "+2349066755440",
  contactEmail: "info@obechlogistics.com",
  mainOffice: "21 road opposite I close, Festac town, Lagos",
  dropoffAddress: "2 Kunle Akinosi St, Orile Oshodi 102214, Lagos 100261 (Beside Greenews Hotel)",
};

// Initialize Supabase Realtime Broadcast Channel for Live Updates
const cmsChannel = supabase.channel("obech-cms-realtime");

cmsChannel
  .on("broadcast", { event: "cms_update" }, ({ payload }) => {
    try {
      localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(payload));
      window.dispatchEvent(new CustomEvent("obech_cms_updated", { detail: payload }));
    } catch (err) {
      console.warn("Unable to write broadcast update to LocalStorage:", err);
    }
  })
  .subscribe();

/**
 * Loads dynamic CMS copy and settings persistently from Supabase locations table
 */
export async function loadCmsDataFromCloud() {
  try {
    const { data, error } = await supabase
      .from("locations")
      .select("address")
      .eq("id", CMS_ROW_ID)
      .maybeSingle();

    if (error) {
      console.warn("Unable to retrieve persistent CMS from Supabase cloud:", error.message);
      return null;
    }

    if (data && data.address) {
      try {
        const parsed = JSON.parse(data.address);
        localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(parsed));
        // Notify all active React state components
        window.dispatchEvent(new CustomEvent("obech_cms_updated", { detail: parsed }));
        return parsed;
      } catch (parseErr) {
        console.error("Failed to parse remote CMS payload:", parseErr);
      }
    }
  } catch (err) {
    console.warn("Supabase check cloud CMS error:", err);
  }
  return null;
}

/**
 * Retrieves CMS settings & dynamic text from LocalStorage with fallback to defaults
 */
export function getCmsData() {
  try {
    const raw = localStorage.getItem(CMS_STORAGE_KEY);
    if (!raw) {
      return {
        slides: DEFAULT_SLIDES,
        testimonials: DEFAULT_TESTIMONIALS,
        stats: DEFAULT_STATS,
        cta: DEFAULT_CTA,
        settings: DEFAULT_SETTINGS,
      };
    }
    const parsed = JSON.parse(raw);
    return {
      slides: parsed.slides && parsed.slides.length > 0 ? parsed.slides : DEFAULT_SLIDES,
      testimonials: parsed.testimonials && parsed.testimonials.length > 0 ? parsed.testimonials : DEFAULT_TESTIMONIALS,
      stats: parsed.stats && parsed.stats.length > 0 ? parsed.stats : DEFAULT_STATS,
      cta: { ...DEFAULT_CTA, ...parsed.cta },
      settings: { ...DEFAULT_SETTINGS, ...parsed.settings },
    };
  } catch (err) {
    console.error("Error reading CMS data:", err);
    return {
      slides: DEFAULT_SLIDES,
      testimonials: DEFAULT_TESTIMONIALS,
      stats: DEFAULT_STATS,
      cta: DEFAULT_CTA,
      settings: DEFAULT_SETTINGS,
    };
  }
}

/**
 * Saves modified CMS data to LocalStorage, Broadcasts Live to other clients, and persists to Supabase cloud
 */
export function saveCmsData(data) {
  try {
    const current = getCmsData();
    const updated = { ...current, ...data };
    localStorage.setItem(CMS_STORAGE_KEY, JSON.stringify(updated));

    // Dispatch locally for instant reactivity in current tab
    window.dispatchEvent(new CustomEvent("obech_cms_updated", { detail: updated }));

    // Send Realtime Broadcast to all other open browsers/tabs instantly
    cmsChannel.send({
      type: "broadcast",
      event: "cms_update",
      payload: updated,
    });

    // Persist persistently to Supabase database (uses locations table which permits SELECT public and ALL authenticated write)
    supabase
      .from("locations")
      .upsert({
        id: CMS_ROW_ID,
        name: "cms_content",
        address: JSON.stringify(updated),
        city: "CMS Store",
        is_active: true,
      })
      .then(({ error }) => {
        if (error) {
          console.error("Could not write persistent CMS update to Supabase cloud database:", error.message);
        } else {
          console.log("Successfully persisted updated CMS data to Supabase cloud.");
        }
      });

    return updated;
  } catch (err) {
    console.error("Error saving CMS data:", err);
    return null;
  }
}

/**
 * Retrieves quote requests stored locally
 */
export function getQuoteRequests() {
  try {
    const raw = localStorage.getItem(QUOTES_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves a new quote request to local storage and attempts to sync with Supabase shipments table
 */
export async function saveQuoteRequest(quoteData) {
  try {
    const timestamp = new Date().toISOString();
    const trackingId = `OBL-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newQuote = {
      id: "quote-" + Date.now(),
      tracking_id: trackingId,
      created_at: timestamp,
      status: "pending",
      origin_country: quoteData.originCountry,
      origin_country_code: quoteData.originCountryCode || "",
      destination_country: quoteData.destinationCountry,
      destination_country_code: quoteData.destinationCountryCode || "",
      dial_code: quoteData.dialCode || "+234",
      dimensions: quoteData.dimensions || null,
      volumetric_weight: quoteData.volumetricWeight || null,
      ...quoteData,
    };

    // Store in localStorage
    const existing = getQuoteRequests();
    const updated = [newQuote, ...existing];
    localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify(updated));

    // Try Supabase insert
    try {
      await supabase.from("shipments").insert({
        tracking_id: trackingId,
        client_name: quoteData.fullName,
        client_email: quoteData.email,
        client_phone: `${quoteData.dialCode || ""} ${quoteData.phone}`.trim(),
        service_type: quoteData.freightType,
        sender_address: `${quoteData.originCountry} (${quoteData.originCountryCode || ""})`,
        receiver_address: `${quoteData.destinationCountry} (${quoteData.destinationCountryCode || ""})`,
        goods_description: quoteData.cargoDescription,
        weight: parseFloat(quoteData.estimatedWeight) || 0,
        special_instructions: [
          quoteData.additionalMessage,
          quoteData.dimensions ? `Dimensions: ${quoteData.dimensions}` : null,
          quoteData.volumetricWeight ? `Volumetric Wt: ${quoteData.volumetricWeight} kg` : null,
        ].filter(Boolean).join(" | "),
        status: "pending",
        created_at: timestamp,
      });
    } catch (dbErr) {
      console.warn("Supabase quote insert fallback to local storage:", dbErr);
    }

    // Direct invocation to send email notification to admin & customer
    try {
      await supabase.functions.invoke("send-email", {
        body: {
          type: "QUOTE",
          record: {
            tracking_id: trackingId,
            client_name: quoteData.fullName,
            client_email: quoteData.email,
            client_phone: `${quoteData.dialCode || ""} ${quoteData.phone}`.trim(),
            service_type: quoteData.freightType,
            sender_address: `${quoteData.originCountry} (${quoteData.originCountryCode || ""})`,
            receiver_address: `${quoteData.destinationCountry} (${quoteData.destinationCountryCode || ""})`,
            goods_description: quoteData.cargoDescription,
            weight_kg: quoteData.estimatedWeight,
            special_instructions: [
              quoteData.additionalMessage,
              quoteData.dimensions ? `Dimensions: ${quoteData.dimensions}` : null,
              quoteData.volumetricWeight ? `Volumetric Wt: ${quoteData.volumetricWeight} kg` : null,
            ].filter(Boolean).join(" | "),
            status: "pending",
          },
        },
      });
    } catch (emailErr) {
      console.warn("Direct quote notification email trigger:", emailErr);
    }

    return newQuote;
  } catch (err) {
    console.error("Error saving quote request:", err);
    throw err;
  }
}
