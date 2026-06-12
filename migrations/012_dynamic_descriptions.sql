-- Add description column to umrah_tiers and scholarships
ALTER TABLE public.umrah_tiers ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.scholarships ADD COLUMN IF NOT EXISTS description TEXT;

-- Update existing records with default descriptions if needed
UPDATE public.umrah_tiers 
SET description = 'An Umrah package designed for pilgrims who want to prioritize comfort, convenience, and privacy. Every detail is crafted to ensure a seamless, stress-free journey.'
WHERE description IS NULL;

UPDATE public.scholarships
SET description = 'An exceptional opportunity for Nigerian students to pursue world-class education. This award covers tuition and providing living support for qualified candidates.'
WHERE description IS NULL;
