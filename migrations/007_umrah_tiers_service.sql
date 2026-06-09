-- Add tier service classification to umrah_tiers so travel and other package tiers can be managed in the same table
ALTER TABLE public.umrah_tiers ADD COLUMN IF NOT EXISTS service TEXT NOT NULL DEFAULT 'umrah';

UPDATE public.umrah_tiers SET service = 'umrah' WHERE service IS NULL;
