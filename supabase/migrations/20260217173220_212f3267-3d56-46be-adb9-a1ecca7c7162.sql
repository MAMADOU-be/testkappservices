
-- Remove the just-created public policy
DROP POLICY IF EXISTS "Public can read reviews via view" ON public.reviews;

-- Drop and recreate the view WITHOUT security_invoker (defaults to security definer behavior)
DROP VIEW IF EXISTS public.reviews_public;
CREATE VIEW public.reviews_public AS
  SELECT rating, comment, created_at, service_request_id
  FROM public.reviews;

-- Grant SELECT on the view to anon and authenticated roles
GRANT SELECT ON public.reviews_public TO anon, authenticated;
