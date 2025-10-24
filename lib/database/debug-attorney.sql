-- Debug script to check attorney data
-- Run this in your Supabase SQL Editor to see what attorneys exist

-- Check if the specific attorney exists
SELECT id, first_name, last_name, firm_name, is_active, membership_tier 
FROM public.attorneys 
WHERE id = '11111111-1111-1111-1111-111111111111';

-- Check all attorneys in the database
SELECT id, first_name, last_name, firm_name, is_active, membership_tier 
FROM public.attorneys 
ORDER BY created_at DESC 
LIMIT 10;

-- Check if there are any attorneys at all
SELECT COUNT(*) as total_attorneys FROM public.attorneys;

-- Check if the attorneys table exists and has data
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'attorneys' 
ORDER BY ordinal_position;
