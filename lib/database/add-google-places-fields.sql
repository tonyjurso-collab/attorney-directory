-- Add Google Places fields to attorneys table
-- This allows attorneys to connect their Google Business Profile for reviews

ALTER TABLE public.attorneys
ADD COLUMN IF NOT EXISTS google_place_id TEXT,
ADD COLUMN IF NOT EXISTS google_rating DECIMAL(2,1),
ADD COLUMN IF NOT EXISTS google_review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS google_reviews_last_synced TIMESTAMPTZ;

-- Create index for efficient lookups by Google Place ID
CREATE INDEX IF NOT EXISTS idx_attorneys_google_place_id ON public.attorneys(google_place_id);

-- Add comments for documentation
COMMENT ON COLUMN public.attorneys.google_place_id IS 'Google Places API Place ID for fetching reviews';
COMMENT ON COLUMN public.attorneys.google_rating IS 'Overall Google rating (1.0-5.0)';
COMMENT ON COLUMN public.attorneys.google_review_count IS 'Total number of Google reviews';
COMMENT ON COLUMN public.attorneys.google_reviews_last_synced IS 'Timestamp of last successful review sync';
