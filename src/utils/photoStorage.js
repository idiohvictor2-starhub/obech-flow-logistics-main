import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import heroAirFreight from "@/assets/images/hero_air_freight_1.png";
import heroCargoLoading from "@/assets/images/hero_cargo_loading_2.png";
import heroSeaportWarehouse from "@/assets/images/hero_seaport_warehouse_3.png";
import whyUs from "@/assets/images/why_us.jpg";

const LEGACY_STORAGE_KEY = "obech_photo_links";
const MEDIA_BUCKET = "site-media";
const PHOTO_UPDATED_EVENT = "obech_photos_updated";
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];

try {
  localStorage.removeItem(LEGACY_STORAGE_KEY);
} catch (error) {
  console.warn("Unable to clear the old browser-only photo cache:", error);
}

export const DEFAULT_PHOTOS = {
  hero_air_freight_1: heroAirFreight,
  hero_cargo_loading_2: heroCargoLoading,
  hero_seaport_warehouse_3: heroSeaportWarehouse,
  why_us: whyUs,
  hero_bg: heroAirFreight,
  service_bike: heroAirFreight,
  service_van: heroSeaportWarehouse,
  service_truck: heroSeaportWarehouse,
  service_business: heroSeaportWarehouse,
};

export const PHOTO_KEYS = Object.keys(DEFAULT_PHOTOS);

export const PRESETS = {
  hero_air_freight_1: [
    { label: "Cargo Aircraft Runway", url: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1600&q=80" },
    { label: "Boeing Freight Takeoff", url: "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=80" },
  ],
  hero_cargo_loading_2: [
    { label: "Tarmac Cargo Pallets", url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1600&q=80" },
  ],
  hero_seaport_warehouse_3: [
    { label: "Seaport Container Terminal", url: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=1600&q=80" },
    { label: "Ocean Freight Vessel", url: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1600&q=80" },
  ],
  why_us: [
    { label: "Global Trade Center", url: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=1200&q=80" },
    { label: "Air Cargo Planning", url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80" },
  ],
};

const assertPhotoKey = (key) => {
  if (!PHOTO_KEYS.includes(key)) {
    throw new Error("Unknown website photo position.");
  }
};

const notifyPhotoUpdate = (key, imageUrl) => {
  window.dispatchEvent(
    new CustomEvent(PHOTO_UPDATED_EVENT, {
      detail: { key, imageUrl },
    })
  );
};

const removeStoredObject = async (storagePath) => {
  if (!storagePath) return;

  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([storagePath]);
  if (error) {
    console.warn("Old photo record removed, but stored file could not be deleted:", error.message);
  }
};

const getCurrentAdminEmail = async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.user?.email || "admin";
};

export function getPhotoUrl(key) {
  return DEFAULT_PHOTOS[key] || "";
}

export async function loadSitePhotos() {
  const { data, error } = await supabase
    .from("site_media")
    .select("slot_key, image_url, storage_path, updated_at")
    .in("slot_key", PHOTO_KEYS);

  if (error) throw new Error(error.message);

  return Object.fromEntries((data || []).map((record) => [record.slot_key, record]));
}

export async function saveSitePhotoLink(key, imageUrl, previousStoragePath = null) {
  assertPhotoKey(key);

  let parsedUrl;
  try {
    parsedUrl = new URL(imageUrl);
  } catch {
    throw new Error("Enter a valid HTTP or HTTPS image link.");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Enter a valid HTTP or HTTPS image link.");
  }

  const record = {
    slot_key: key,
    image_url: parsedUrl.href,
    storage_path: null,
    updated_by: await getCurrentAdminEmail(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("site_media")
    .upsert(record, { onConflict: "slot_key" })
    .select("slot_key, image_url, storage_path, updated_at")
    .single();

  if (error) throw new Error(error.message);

  await removeStoredObject(previousStoragePath);
  notifyPhotoUpdate(key, data.image_url);
  return data;
}

export async function uploadSitePhoto(key, file, previousStoragePath = null) {
  assertPhotoKey(key);

  if (!file) throw new Error("Choose an image from your gallery first.");
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    throw new Error("Use a JPG, PNG, WebP, or AVIF image.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("The image must be 5 MB or smaller.");
  }

  const extensionByType = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
    "image/avif": "avif",
  };
  const uniqueId = typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const storagePath = `${key}/${uniqueId}.${extensionByType[file.type]}`;

  const { error: uploadError } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(storagePath, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) throw new Error(uploadError.message);

  const { data: publicUrlData } = supabase.storage
    .from(MEDIA_BUCKET)
    .getPublicUrl(storagePath);

  const record = {
    slot_key: key,
    image_url: publicUrlData.publicUrl,
    storage_path: storagePath,
    updated_by: await getCurrentAdminEmail(),
    updated_at: new Date().toISOString(),
  };

  const { data, error: saveError } = await supabase
    .from("site_media")
    .upsert(record, { onConflict: "slot_key" })
    .select("slot_key, image_url, storage_path, updated_at")
    .single();

  if (saveError) {
    await removeStoredObject(storagePath);
    throw new Error(saveError.message);
  }

  if (previousStoragePath && previousStoragePath !== storagePath) {
    await removeStoredObject(previousStoragePath);
  }

  notifyPhotoUpdate(key, data.image_url);
  return data;
}

export async function resetSitePhoto(key, previousStoragePath = null) {
  assertPhotoKey(key);

  const { error } = await supabase.from("site_media").delete().eq("slot_key", key);
  if (error) throw new Error(error.message);

  await removeStoredObject(previousStoragePath);
  notifyPhotoUpdate(key, DEFAULT_PHOTOS[key]);
}

export async function resetAllSitePhotos() {
  const records = await loadSitePhotos();
  const { error } = await supabase
    .from("site_media")
    .delete()
    .in("slot_key", PHOTO_KEYS);

  if (error) throw new Error(error.message);

  const storagePaths = Object.values(records)
    .map((record) => record.storage_path)
    .filter(Boolean);

  if (storagePaths.length > 0) {
    const { error: storageError } = await supabase.storage
      .from(MEDIA_BUCKET)
      .remove(storagePaths);

    if (storageError) {
      console.warn("Default photos were restored, but some old stored files remain:", storageError.message);
    }
  }

  localStorage.removeItem(LEGACY_STORAGE_KEY);
  PHOTO_KEYS.forEach((key) => notifyPhotoUpdate(key, DEFAULT_PHOTOS[key]));
}

export function usePhotoUrl(key) {
  const [url, setUrl] = useState(() => getPhotoUrl(key));

  useEffect(() => {
    let isMounted = true;

    const loadPhoto = async () => {
      const { data, error } = await supabase
        .from("site_media")
        .select("image_url")
        .eq("slot_key", key)
        .maybeSingle();

      if (!isMounted) return;
      if (error) {
        console.warn(`Unable to load website photo ${key}:`, error.message);
        return;
      }

      setUrl(data?.image_url || getPhotoUrl(key));
    };

    const handleLocalUpdate = (event) => {
      if (event.detail?.key !== key) return;
      setUrl(event.detail.imageUrl || DEFAULT_PHOTOS[key] || "");
    };

    loadPhoto();
    window.addEventListener(PHOTO_UPDATED_EVENT, handleLocalUpdate);

    const channel = supabase
      .channel(`site-media-${key}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "site_media",
          filter: `slot_key=eq.${key}`,
        },
        (payload) => {
          setUrl(payload.eventType === "DELETE"
            ? DEFAULT_PHOTOS[key] || ""
            : payload.new?.image_url || DEFAULT_PHOTOS[key] || "");
        }
      )
      .subscribe();

    return () => {
      isMounted = false;
      window.removeEventListener(PHOTO_UPDATED_EVENT, handleLocalUpdate);
      supabase.removeChannel(channel);
    };
  }, [key]);

  return url;
}
