
-- Remove the public policy we just added
DROP POLICY IF EXISTS "Public can read reviews for testimonials" ON public.reviews;

-- Drop the view, we'll use an RPC instead
DROP VIEW IF EXISTS public.reviews_public;

-- Create a secure RPC that returns only safe testimonial data
CREATE OR REPLACE FUNCTION public.get_public_testimonials()
RETURNS TABLE(rating integer, comment text, created_at timestamptz, first_name text, city text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.rating, r.comment, r.created_at, sr.first_name, sr.city
  FROM public.reviews r
  JOIN public.service_requests sr ON sr.id = r.service_request_id
  WHERE r.rating >= 4
    AND r.comment IS NOT NULL
  ORDER BY r.rating DESC, r.created_at DESC
  LIMIT 6
$$;
