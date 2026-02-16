-- Drop the restrictive public policy
DROP POLICY "Anyone can view reviews" ON public.reviews;

-- Recreate as PERMISSIVE so it works independently
CREATE POLICY "Anyone can view reviews"
ON public.reviews
FOR SELECT
TO public
USING (true);

-- Also make existing SELECT policies permissive
DROP POLICY "Users can view own reviews" ON public.reviews;
CREATE POLICY "Users can view own reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

DROP POLICY "Staff can view all reviews" ON public.reviews;
CREATE POLICY "Staff can view all reviews"
ON public.reviews
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'employee'::app_role));
