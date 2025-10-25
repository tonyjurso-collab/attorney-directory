-- Update attorney_practice_areas table to remove is_primary column
-- This removes the primary designation since we now use separate categories table

-- Remove is_primary column from attorney_practice_areas (no longer needed)
ALTER TABLE public.attorney_practice_areas DROP COLUMN IF EXISTS is_primary;

-- Add comment for documentation
COMMENT ON TABLE public.attorney_practice_areas IS 'Junction table linking attorneys to their selected practice area subcategories';
