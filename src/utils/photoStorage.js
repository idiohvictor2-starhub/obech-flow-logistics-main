import { useState, useEffect } from "react";

const STORAGE_KEY = "obech_photo_links";

export const DEFAULT_PHOTOS = {
  hero_bg: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=80",
  why_us: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=80",
  service_bike: "https://images.unsplash.com/photo-1581092335878-2d9ff86ca2bf?auto=format&fit=crop&w=900&q=80",
  service_van: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=900&q=80",
  service_truck: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&w=900&q=80",
  service_business: "https://images.unsplash.com/photo-1515168833906-d2a3b82b1a48?auto=format&fit=crop&w=900&q=80",
};

// Preset photo options to easily switch to alternative high-quality graphics
export const PRESETS = {
  hero_bg: [
    { label: "Modern Warehouse", url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=80" },
    { label: "Cargo Ship at Port", url: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=1600&q=80" },
    { label: "Cargo Airplane Loading", url: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1600&q=80" },
    { label: "Logistics Fleet Trucks", url: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1600&q=80" }
  ],
  why_us: [
    { label: "Logistics Team", url: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1200&q=80" },
    { label: "Operations Center", url: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=1200&q=80" },
    { label: "Shipment Planning", url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80" }
  ],
  service_bike: [
    { label: "Delivery Rider City", url: "https://images.unsplash.com/photo-1581092335878-2d9ff86ca2bf?auto=format&fit=crop&w=900&q=80" },
    { label: "Motorcycle Dispatch", url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=900&q=80" }
  ],
  service_van: [
    { label: "White Cargo Van", url: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=900&q=80" },
    { label: "Van Fleet", url: "https://images.unsplash.com/photo-1516575150278-77136aed6920?auto=format&fit=crop&w=900&q=80" }
  ],
  service_truck: [
    { label: "Hauling Truck High", url: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&w=900&q=80" },
    { label: "Highway Truck Cargo", url: "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=900&q=80" }
  ],
  service_business: [
    { label: "Forklift in Action", url: "https://images.unsplash.com/photo-1515168833906-d2a3b82b1a48?auto=format&fit=crop&w=900&q=80" },
    { label: "Warehouse Inventory", url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=80" }
  ]
};

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
