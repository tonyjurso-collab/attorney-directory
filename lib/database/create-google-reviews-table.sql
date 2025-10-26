-- Create google_reviews table for caching individual reviews
-- This stores the 5 most recent reviews from Google Places API

CREATE TABLE IF NOT EXISTS public.google_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attorney_id UUID NOT NULL REFERENCES public.attorneys(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  author_photo_url TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  time BIGINT NOT NULL, -- Unix timestamp from Google
  relative_time_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(attorney_id, time) -- Prevent duplicate reviews
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_google_reviews_attorney_id ON public.google_reviews(attorney_id);
CREATE INDEX IF NOT EXISTS idx_google_reviews_rating ON public.google_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_google_reviews_time ON public.google_reviews(time DESC);

-- Add comments for documentation
COMMENT ON TABLE public.google_reviews IS 'Cached Google reviews for attorneys';
COMMENT ON COLUMN public.google_reviews.attorney_id IS 'Reference to attorney';
COMMENT ON COLUMN public.google_reviews.author_name IS 'Name of review author';
COMMENT ON COLUMN public.google_reviews.author_photo_url IS 'Profile photo URL of review author';
COMMENT ON COLUMN public.google_reviews.rating IS 'Review rating (1-5 stars)';
COMMENT ON COLUMN public.google_reviews.text IS 'Review text content';
COMMENT ON COLUMN public.google_reviews.time IS 'Unix timestamp when review was published';
COMMENT ON COLUMN public.google_reviews.relative_time_description IS 'Human-readable time (e.g., "2 weeks ago")';
