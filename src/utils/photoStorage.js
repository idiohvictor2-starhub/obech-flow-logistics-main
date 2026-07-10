import { useState, useEffect } from "react";

import heroBg from "@/assets/images/hero_bg.jpg";
import whyUs from "@/assets/images/why_us.jpg";
import serviceBike from "@/assets/images/service_bike.jpg";
import serviceVan from "@/assets/images/service_van.jpg";
import serviceTruck from "@/assets/images/service_truck.jpg";
import serviceBusiness from "@/assets/images/service_business.jpg";

const STORAGE_KEY = "obech_photo_links";

export const DEFAULT_PHOTOS = {
  hero_bg: heroBg,
  why_us: whyUs,
  service_bike: serviceBike,
  service_van: serviceVan,
  service_truck: serviceTruck,
  service_business: serviceBusiness,
};

// Preset photo options to easily switch to alternative high-quality graphics
export const PRESETS = {
  hero_bg: [
    { label: "Modern Warehouse", url: heroBg },
    { label: "Cargo Ship at Port", url: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=1600&q=80" },
    { label: "Cargo Airplane Loading", url: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1600&q=80" }
  ],
  why_us: [
    { label: "Logistics Team", url: whyUs },
    { label: "Operations Center", url: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=1200&q=80" },
    { label: "Shipment Planning", url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80" }
  ],
  service_bike: [
    { label: "Delivery Rider City", url: serviceBike },
    { label: "Motorcycle Dispatch", url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80" }
  ],
  service_van: [
    { label: "White Cargo Van", url: serviceVan },
    { label: "Van Fleet", url: "https://images.unsplash.com/photo-1516575150278-77136aed6920?auto=format&fit=crop&w=900&q=80" }
  ],
  service_truck: [
    { label: "Hauling Truck High", url: serviceTruck },
    { label: "Highway Truck Cargo", url: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=900&q=80" }
  ],
  service_business: [
    { label: "Warehouse Inventory", url: serviceBusiness },
    { label: "Forklift in Action", url: "https://images.unsplash.com/photo-1515168833906-d2a3b82b1a48?auto=format&fit=crop&w=900&q=80" }
  ]
};

// Migration: clear old unsplash links from local storage so new local assets are used
try {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && stored.includes("unsplash.com")) {
    localStorage.removeItem(STORAGE_KEY);
  }
} catch (e) {}

export function getPhotoUrl(key) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed[key]) return parsed[key];
    }
  } catch (e) {
    console.error("Error loading photo links from localStorage:", e);
  }
  return DEFAULT_PHOTOS[key] || "";
}

export function setPhotoUrl(key, url) {
  try {
    const stored = localStorage.getItem(STORAGE_KEY) || "{}";
    const parsed = JSON.parse(stored);
    parsed[key] = url;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
    // Dispatch custom event for real-time reactive UI update in standard windows
    window.dispatchEvent(new Event("obech_photos_updated"));
  } catch (e) {
    console.error("Error saving photo link to localStorage:", e);
  }
}

export function resetPhotos() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(new Event("obech_photos_updated"));
  } catch (e) {
    console.error("Error resetting photos:", e);
  }
}

export function usePhotoUrl(key) {
  const [url, setUrl] = useState(() => getPhotoUrl(key));

  useEffect(() => {
    const handleUpdate = () => {
      setUrl(getPhotoUrl(key));
    };
    window.addEventListener("obech_photos_updated", handleUpdate);
    return () => window.removeEventListener("obech_photos_updated", handleUpdate);
  }, [key]);

  return url;
}
