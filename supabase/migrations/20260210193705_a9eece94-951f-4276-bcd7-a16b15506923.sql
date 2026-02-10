
-- Allow clients to view their own service requests by email
CREATE POLICY "Users can view their own requests by email"
ON public.service_requests
FOR SELECT
TO authenticated
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));
