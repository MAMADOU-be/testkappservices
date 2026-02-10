-- Remove the now-redundant staff-only SELECT policy since the new policy already includes staff access
DROP POLICY IF EXISTS "Staff can view all service requests" ON public.service_requests;