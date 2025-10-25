-- Add primary practice category to attorneys table
-- This adds a column to store the primary practice area category

-- Add primary_practice_category_id column if it doesn't exist
ALTER TABLE public.attorneys 
ADD COLUMN IF NOT EXISTS primary_practice_category_id UUID REFERENCES public.practice_area_categories(id);

-- Add comment for documentation
COMMENT ON COLUMN public.attorneys.primary_practice_category_id IS 'Primary practice area category for the attorney';
