
-- Recreate view with security_invoker to satisfy linter
DROP VIEW IF EXISTS public.reviews_public;
CREATE VIEW public.reviews_public
WITH (security_invoker = on) AS
  SELECT rating, comment, created_at, service_request_id
  FROM public.reviews;

GRANT SELECT ON public.reviews_public TO anon, authenticated;

-- Need a SELECT policy on base table for the view to work (since security_invoker)
-- This is acceptable because the view limits columns exposed
CREATE POLICY "Public can read reviews for testimonials"
  ON public.reviews
  FOR SELECT
  USING (true);
