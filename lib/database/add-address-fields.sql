-- Add suite_number field to attorneys table
-- This migration adds the suite_number field to store office suite information

-- Add suite_number column if it doesn't exist
ALTER TABLE public.attorneys 
ADD COLUMN IF NOT EXISTS suite_number TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.attorneys.suite_number IS 'Suite, office, or unit number for the attorney''s business address';
