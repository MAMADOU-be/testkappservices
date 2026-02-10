-- Create a security definer function to get the current user's email
CREATE OR REPLACE FUNCTION public.get_auth_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email::text FROM auth.users WHERE id = auth.uid()
$$;

-- Drop the old problematic policy
DROP POLICY IF EXISTS "Users can view their own requests by email" ON public.service_requests;

-- Recreate with the security definer function
CREATE POLICY "Users can view their own requests by email"
ON public.service_requests
FOR SELECT
USING (
  email = public.get_auth_email()
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'employee'::app_role)
);