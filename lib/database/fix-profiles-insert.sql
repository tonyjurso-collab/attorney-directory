-- Fix missing INSERT policy for profiles table
-- This allows users to create their own profile during registration

CREATE POLICY "Users can create their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Also add INSERT policy for attorneys table
CREATE POLICY "Users can create their own attorney profile" ON public.attorneys
  FOR INSERT WITH CHECK (auth.uid() = user_id);
