-- Manual migration script for profiles table
-- Run this in your Supabase SQL editor or database client

-- Add new columns
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_first_name ON public.profiles(first_name);
CREATE INDEX IF NOT EXISTS idx_profiles_last_name ON public.profiles(last_name);

-- Verify the migration
SELECT 
  id, 
  email, 
  first_name, 
  last_name, 
  full_name,
  role,
  created_at
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 10;
