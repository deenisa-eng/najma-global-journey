-- Create medical_affiliations table
CREATE TABLE IF NOT EXISTS public.medical_affiliations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    specialties TEXT[] DEFAULT '{}',
    description TEXT,
    image_url TEXT,
    link TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.medical_affiliations ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DROP POLICY IF EXISTS "Allow public read access on medical_affiliations" ON public.medical_affiliations;
CREATE POLICY "Allow public read access on medical_affiliations"
ON public.medical_affiliations FOR SELECT
TO anon, authenticated
USING (true);

-- Allow admin full access
DROP POLICY IF EXISTS "Allow admin full access on medical_affiliations" ON public.medical_affiliations;
CREATE POLICY "Allow admin full access on medical_affiliations"
ON public.medical_affiliations FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Seed initial data
INSERT INTO public.medical_affiliations (id, name, location, specialties, description, is_featured)
VALUES 
('apollo-india', 'Apollo Hospitals', 'Chennai, India', ARRAY['Cardiology', 'Oncology', 'Transplants'], 'One of Asia’s largest healthcare groups with world-class clinical outcomes.', TRUE),
('memorial-turkey', 'Memorial Healthcare', 'Istanbul, Turkey', ARRAY['IVF', 'Cosmetic Surgery', 'Orthopedics'], 'A leading healthcare provider in Turkey known for high success rates in IVF and complex surgeries.', FALSE)
ON CONFLICT (id) DO NOTHING;
