-- Debug and fix RLS policies for registration
-- Run this in your Supabase SQL Editor

-- First, let's check what policies currently exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('profiles', 'attorneys');

-- Drop any existing conflicting policies (if they exist)
DROP POLICY IF EXISTS "Users can create their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create their own attorney profile" ON public.attorneys;

-- Create the correct INSERT policies
CREATE POLICY "Users can create their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can create their own attorney profile" ON public.attorneys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Also ensure we have the necessary SELECT policies for the user to read their own data
CREATE POLICY IF NOT EXISTS "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can view their own attorney profile" ON public.attorneys
  FOR SELECT USING (auth.uid() = user_id);

-- Verify the policies were created
SELECT schemaname, tablename, policyname, cmd, with_check
FROM pg_policies 
WHERE tablename IN ('profiles', 'attorneys')
ORDER BY tablename, policyname;
