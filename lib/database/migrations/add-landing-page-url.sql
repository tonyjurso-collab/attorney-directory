-- Migration: Add landing_page_url column to chat_sessions table
-- Run this migration on your Supabase database

-- Add the landing_page_url column if it doesn't exist
ALTER TABLE public.chat_sessions 
ADD COLUMN IF NOT EXISTS landing_page_url TEXT;

-- Add an index for faster queries on landing page URL (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_chat_sessions_landing_page_url ON public.chat_sessions (landing_page_url);

-- Add a comment to document the column
COMMENT ON COLUMN public.chat_sessions.landing_page_url IS 'URL of the landing page where the chat was initiated';
