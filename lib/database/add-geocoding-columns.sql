-- Add geocoding columns to attorneys table
-- This script adds latitude and longitude columns to store attorney coordinates

-- Add latitude column
ALTER TABLE attorneys 
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8);

-- Add longitude column  
ALTER TABLE attorneys 
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8);

-- Add formatted address column for display
ALTER TABLE attorneys 
ADD COLUMN IF NOT EXISTS formatted_address TEXT;

-- Add index for geospatial queries (will be useful for radius searches)
CREATE INDEX IF NOT EXISTS idx_attorneys_location 
ON attorneys (latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Add index for city/state searches
CREATE INDEX IF NOT EXISTS idx_attorneys_city_state 
ON attorneys (city, state);

-- Add comment to document the new columns
COMMENT ON COLUMN attorneys.latitude IS 'Latitude coordinate for geospatial searches';
COMMENT ON COLUMN attorneys.longitude IS 'Longitude coordinate for geospatial searches';
COMMENT ON COLUMN attorneys.formatted_address IS 'Formatted address from geocoding service';

-- Update RLS policies to include new columns
-- (The existing policies should automatically include new columns, but let's verify)

-- Test the new columns exist
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'attorneys' 
  AND column_name IN ('latitude', 'longitude', 'formatted_address')
ORDER BY column_name;
