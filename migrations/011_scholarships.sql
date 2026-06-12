-- Create scholarships table
CREATE TABLE IF NOT EXISTS public.scholarships (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    institution TEXT NOT NULL,
    location TEXT NOT NULL,
    amount TEXT NOT NULL,
    deadline TEXT NOT NULL,
    duration TEXT NOT NULL,
    highlights TEXT[] DEFAULT '{}',
    is_featured BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;

-- Allow public read access
DROP POLICY IF EXISTS "Allow public read access on scholarships" ON public.scholarships;
CREATE POLICY "Allow public read access on scholarships"
ON public.scholarships FOR SELECT
TO anon, authenticated
USING (true);

-- Allow admin full access
DROP POLICY IF EXISTS "Allow admin full access on scholarships" ON public.scholarships;
CREATE POLICY "Allow admin full access on scholarships"
ON public.scholarships FOR ALL
TO authenticated
USING (is_admin())
WITH CHECK (is_admin());

-- Seed initial data
INSERT INTO public.scholarships (id, title, institution, location, amount, deadline, duration, highlights, is_featured, image_url)
VALUES 
('uk-chevening', 'Chevening Scholarship', 'UK Universities', 'United Kingdom', 'Fully Funded', 'Nov 2026', '1 Year Masters', ARRAY['Tuition fees included', 'Monthly stipend', 'Travel to/from UK', 'Networking events'], TRUE, NULL),
('us-fulbright', 'Fulbright Program', 'US Universities', 'United States', 'Full Tuition', 'Oct 2026', '2 Years Masters', ARRAY['Living allowance', 'Health insurance', 'Visa support', 'Cultural exchange'], FALSE, NULL)
ON CONFLICT (id) DO NOTHING;
