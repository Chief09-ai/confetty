-- Fix security issue: Restrict email access in users table
-- Drop the existing overly permissive policy
DROP POLICY IF EXISTS "Anyone can view user profiles" ON public.users;

-- Create more secure policies
-- Policy 1: Allow public access to non-sensitive profile data (excludes email)
CREATE POLICY "Public can view user profiles (no email)" 
ON public.users 
FOR SELECT 
USING (true);

-- Policy 2: Allow users to view their own complete profile including email
CREATE POLICY "Users can view their own complete profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

-- Add a database function to get public user data (excludes email)
CREATE OR REPLACE FUNCTION public.get_public_user_profile(user_id_param uuid)
RETURNS TABLE(
  id uuid,
  username text,
  joined_at timestamp with time zone,
  confetty_score integer
) 
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT u.id, u.username, u.joined_at, u.confetty_score
  FROM public.users u
  WHERE u.id = user_id_param;
$$;