-- Migration: Add first_name and last_name columns to profiles table
-- This migration adds separate name fields to replace full_name

-- Add new columns
ALTER TABLE public.profiles 
ADD COLUMN first_name TEXT,
ADD COLUMN last_name TEXT;

-- Migrate existing data (split full_name on first space)
UPDATE public.profiles 
SET 
  first_name = CASE 
    WHEN full_name IS NOT NULL AND full_name != '' THEN 
      TRIM(SPLIT_PART(full_name, ' ', 1))
    ELSE NULL 
  END,
  last_name = CASE 
    WHEN full_name IS NOT NULL AND full_name != '' AND POSITION(' ' IN full_name) > 0 THEN 
      TRIM(SUBSTRING(full_name FROM POSITION(' ' IN full_name) + 1))
    ELSE NULL 
  END
WHERE first_name IS NULL OR last_name IS NULL;

-- Make columns NOT NULL for new records (optional - can be done after testing)
-- ALTER TABLE public.profiles ALTER COLUMN first_name SET NOT NULL;
-- ALTER TABLE public.profiles ALTER COLUMN last_name SET NOT NULL;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_first_name ON public.profiles(first_name);
CREATE INDEX IF NOT EXISTS idx_profiles_last_name ON public.profiles(last_name);

-- Note: We keep full_name column for backwards compatibility
-- It can be removed later after confirming all applications use first_name/last_name
