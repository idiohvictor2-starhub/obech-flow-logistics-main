-- Obech Flow Logistics Supabase Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- TABLE: locations (Hubs/Locations)
CREATE TABLE public.locations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text,
    latitude numeric,
    longitude numeric,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- TABLE: routes
CREATE TABLE public.routes (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_name text NOT NULL,
    origin text NOT NULL,
    destination text NOT NULL,
    transit_days integer,
    distance_km numeric,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- TABLE: drivers
CREATE TABLE public.drivers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name text NOT NULL,
    phone text NOT NULL,
    email text,
    vehicle_type text,
    license_plate text,
    zone text,
    availability text DEFAULT 'available', -- available | on_delivery | off_duty
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- TABLE: pricing_rules
CREATE TABLE public.pricing_rules (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    delivery_type text NOT NULL,
    base_price numeric NOT NULL,
    price_per_kg numeric DEFAULT 0,
    price_per_km numeric DEFAULT 0,
    speed_multiplier numeric DEFAULT 1.0,
    route_id uuid REFERENCES public.routes(id), -- NULL = applies to all routes
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

-- TABLE: shipments
CREATE TABLE public.shipments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    tracking_id text UNIQUE NOT NULL, -- e.g. OBL-2024-XXXXXX
    client_name text NOT NULL,
    client_email text,
    client_phone text,
    sender_address text NOT NULL,
    receiver_name text NOT NULL,
    receiver_address text NOT NULL,
    receiver_phone text,
    package_type text, -- documents / electronics / fragile / general
    weight_kg numeric,
    declared_value numeric,
    delivery_type text, -- standard / express / same-day
    route_id uuid REFERENCES public.routes(id),
    driver_id uuid REFERENCES public.drivers(id),
    status text DEFAULT 'pending', -- pending | confirmed | picked_up | in_transit | out_for_delivery | delivered | failed
    status_note text, -- internal admin note on last update
    special_instructions text, -- customer notes and instructions
    estimated_delivery date,
    booking_source text NOT NULL DEFAULT 'online' CHECK (booking_source IN ('online', 'office')),
    receipt_number text UNIQUE,
    total_amount numeric(12,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    amount_paid numeric(12,2) NOT NULL DEFAULT 0 CHECK (amount_paid >= 0 AND amount_paid <= total_amount),
    payment_status text NOT NULL DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
    payment_method text,
    payment_reference text,
    created_by text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- TABLE: status_history
CREATE TABLE public.status_history (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    shipment_id uuid REFERENCES public.shipments(id) ON DELETE CASCADE,
    status text NOT NULL,
    note text,
    updated_by text NOT NULL, -- admin user email or name
    created_at timestamptz DEFAULT now()
);

-- TABLE: site_media (Global Website Photos)
CREATE TABLE public.site_media (
    slot_key text PRIMARY KEY,
    image_url text NOT NULL,
    storage_path text,
    updated_by text,
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT site_media_slot_key_check CHECK (
        slot_key IN (
            'hero_bg',
            'why_us',
            'service_bike',
            'service_van',
            'service_truck',
            'service_business'
        )
    )
);


-- TRIGGERS for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_shipments_updated_at
    BEFORE UPDATE ON public.shipments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();


-- ROW LEVEL SECURITY (RLS)
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_media ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
-- Note: In Supabase, if we create tables in the public schema, 
-- users with the 'authenticated' role are logged in via Supabase Auth.
-- We will assume any authenticated user is an admin for this MVP.

-- Locations Policies
CREATE POLICY "Admins can manage locations" ON public.locations FOR ALL TO authenticated USING (true);
CREATE POLICY "Public can view active locations" ON public.locations FOR SELECT TO anon USING (is_active = true);

-- Routes Policies
CREATE POLICY "Admins can manage routes" ON public.routes FOR ALL TO authenticated USING (true);
CREATE POLICY "Public can view active routes" ON public.routes FOR SELECT TO anon USING (is_active = true);

-- Drivers Policies
CREATE POLICY "Admins can manage drivers" ON public.drivers FOR ALL TO authenticated USING (true);

-- Pricing Policies
CREATE POLICY "Admins can manage pricing" ON public.pricing_rules FOR ALL TO authenticated USING (true);
CREATE POLICY "Public can view active pricing" ON public.pricing_rules FOR SELECT TO anon USING (is_active = true);

-- Shipments Policies
CREATE POLICY "Admins can manage shipments" ON public.shipments FOR ALL TO authenticated USING (true);
CREATE POLICY "Public can view shipment by tracking_id" ON public.shipments FOR SELECT TO anon USING (true); 
CREATE POLICY "Public can insert shipments" ON public.shipments FOR INSERT TO anon WITH CHECK (true);
-- Public cannot see status_note directly (we should ideally hide it via a view or handle it in the app by not displaying it, 
-- but since RLS operates at the row level, we just allow the row for SELECT, and the frontend will filter status_note).

-- Status History Policies
CREATE POLICY "Admins can manage status_history" ON public.status_history FOR ALL TO authenticated USING (true);
CREATE POLICY "Public can view status_history for a shipment" ON public.status_history FOR SELECT TO anon USING (true); 
-- Again, frontend will filter `note` if we want to hide admin notes, or we can restrict columns, but row level is simpler for now.

-- Site Media Policies
CREATE POLICY "Public can view site media" ON public.site_media FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage site media" ON public.site_media FOR ALL TO authenticated USING (true) WITH CHECK (true);

GRANT SELECT ON public.site_media TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.site_media TO authenticated;

-- Public image bucket for admin-managed website photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'site-media',
    'site-media',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

CREATE POLICY "Public can view site media files" ON storage.objects
    FOR SELECT TO anon, authenticated USING (bucket_id = 'site-media');
CREATE POLICY "Admins can upload site media files" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'site-media');
CREATE POLICY "Admins can update site media files" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'site-media') WITH CHECK (bucket_id = 'site-media');
CREATE POLICY "Admins can delete site media files" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'site-media');

-- REALTIME CONFIGURATION
-- Enable realtime for shipments
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table public.shipments;
alter publication supabase_realtime add table public.site_media;
