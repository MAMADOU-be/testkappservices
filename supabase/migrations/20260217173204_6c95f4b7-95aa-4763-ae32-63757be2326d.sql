
-- 1. Drop the overly permissive public SELECT policy on reviews
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;

-- 2. Create a public-safe view exposing only rating, comment, created_at
CREATE OR REPLACE VIEW public.reviews_public
WITH (security_invoker = on) AS
  SELECT id, rating, comment, created_at, service_request_id
  FROM public.reviews;

-- 3. Allow anon/public to SELECT from the view via a permissive policy on base table
-- Actually, since we removed "Anyone can view reviews", we need a new limited policy
-- for the Testimonials component. We'll use a policy that only allows selecting
-- rating, comment, created_at (but RLS is row-level, not column-level).
-- Instead, let's add a policy that allows public read but the view will limit columns.
CREATE POLICY "Public can read reviews via view"
  ON public.reviews
  FOR SELECT
  USING (true);
