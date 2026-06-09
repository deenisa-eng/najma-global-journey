-- Add image_url to umrah_tiers table
ALTER TABLE public.umrah_tiers ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Create storage bucket if not exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('package-images', 'package-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for package-images bucket
-- Allow public access to read images
DROP POLICY IF EXISTS "Public Read Access" ON storage.objects;
CREATE POLICY "Public Read Access" ON storage.objects
    FOR SELECT TO public USING (bucket_id = 'package-images');

-- Allow authenticated users to upload/update/delete images
DROP POLICY IF EXISTS "Admin Upload Access" ON storage.objects;
CREATE POLICY "Admin Upload Access" ON storage.objects
    FOR INSERT TO authenticated WITH CHECK (bucket_id = 'package-images');

DROP POLICY IF EXISTS "Admin Update Access" ON storage.objects;
CREATE POLICY "Admin Update Access" ON storage.objects
    FOR UPDATE TO authenticated USING (bucket_id = 'package-images');

DROP POLICY IF EXISTS "Admin Delete Access" ON storage.objects;
CREATE POLICY "Admin Delete Access" ON storage.objects
    FOR DELETE TO authenticated USING (bucket_id = 'package-images');
