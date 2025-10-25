-- Add attorney_practice_categories junction table
-- This creates a many-to-many relationship between attorneys and practice area categories

-- Create attorney_practice_categories table
CREATE TABLE IF NOT EXISTS public.attorney_practice_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  attorney_id UUID REFERENCES public.attorneys(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.practice_area_categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(attorney_id, category_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attorney_practice_categories_attorney_id ON public.attorney_practice_categories(attorney_id);
CREATE INDEX IF NOT EXISTS idx_attorney_practice_categories_category_id ON public.attorney_practice_categories(category_id);

-- Remove primary_practice_category_id column from attorneys table (no longer needed)
ALTER TABLE public.attorneys DROP COLUMN IF EXISTS primary_practice_category_id;

-- Add comment for documentation
COMMENT ON TABLE public.attorney_practice_categories IS 'Junction table linking attorneys to their selected practice area categories';
