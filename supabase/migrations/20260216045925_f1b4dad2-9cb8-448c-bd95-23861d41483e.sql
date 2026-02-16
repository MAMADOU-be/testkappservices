-- Drop the broken INSERT policy
DROP POLICY "Users can create reviews" ON public.reviews;

-- Recreate with get_auth_email() instead of joining auth.users
CREATE POLICY "Users can create reviews"
ON public.reviews
FOR INSERT
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1
    FROM public.service_requests sr
    WHERE sr.id = reviews.service_request_id
      AND sr.email = get_auth_email()
      AND sr.status = 'completed'
  )
);
