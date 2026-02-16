-- Allow anyone to read reviews (public testimonials)
CREATE POLICY "Anyone can view reviews"
ON public.reviews
FOR SELECT
USING (true);
