
-- Drop old policy
DROP POLICY IF EXISTS "Users can view their own requests by email" ON public.service_requests;

-- Recreate with restricted employee access
CREATE POLICY "Users can view own requests or authorized staff"
ON public.service_requests
FOR SELECT
USING (
  email = get_auth_email()
  OR has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'employee'::app_role) AND assigned_to = auth.uid())
);
