-- Create umrah_tiers table
CREATE TABLE IF NOT EXISTS public.umrah_tiers (
    id TEXT PRIMARY KEY,
    tier TEXT NOT NULL,
    stars INTEGER NOT NULL,
    price BIGINT NOT NULL,
    duration TEXT NOT NULL,
    total_seats INTEGER NOT NULL,
    seats_booked INTEGER DEFAULT 0,
    highlights TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.umrah_tiers ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DROP POLICY IF EXISTS "Allow public read access on umrah_tiers" ON public.umrah_tiers;
CREATE POLICY "Allow public read access on umrah_tiers"
ON public.umrah_tiers FOR SELECT
TO anon, authenticated
USING (true);

-- Allow admin full access
DROP POLICY IF EXISTS "Allow admin full access on umrah_tiers" ON public.umrah_tiers;
CREATE POLICY "Allow admin full access on umrah_tiers"
ON public.umrah_tiers FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Seed initial data
INSERT INTO public.umrah_tiers (id, tier, stars, price, duration, total_seats, seats_booked, highlights, is_featured)
VALUES 
('premium', 'Premium', 5, 5500000, '14 Days Makkah & Madinah', 15, 3, ARRAY['Haram-facing 5★ hotels', 'Direct Kano → Jeddah', 'Private VIP transfers', 'Dedicated scholar'], FALSE),
('luxury', 'Luxury', 5, 3800000, '14 Days Makkah & Madinah', 50, 14, ARRAY['5★ within 400m of Haram', 'Visa & ticketing', 'Shared ground transport', 'Group scholar'], TRUE),
('economy', 'Economy', 4, 3000000, '14 Days Makkah & Madinah', 185, 69, ARRAY['4★ central hotels', 'Visa processing', 'Group transfers', 'All meals included'], FALSE)
ON CONFLICT (id) DO NOTHING;
