-- Add SEO and landing page fields to practice_area_categories
ALTER TABLE public.practice_area_categories
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS hero_title TEXT,
ADD COLUMN IF NOT EXISTS hero_subtitle TEXT,
ADD COLUMN IF NOT EXISTS hero_image_url TEXT;

-- Add SEO and landing page fields to practice_areas
ALTER TABLE public.practice_areas
ADD COLUMN IF NOT EXISTS meta_title TEXT,
ADD COLUMN IF NOT EXISTS meta_description TEXT,
ADD COLUMN IF NOT EXISTS hero_title TEXT,
ADD COLUMN IF NOT EXISTS hero_subtitle TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_practice_area_categories_meta ON public.practice_area_categories (meta_title, meta_description);
CREATE INDEX IF NOT EXISTS idx_practice_areas_meta ON public.practice_areas (meta_title, meta_description);
