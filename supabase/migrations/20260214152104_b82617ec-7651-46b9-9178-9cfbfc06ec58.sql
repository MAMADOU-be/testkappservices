
-- Function to check if an employee is assigned to a client
CREATE OR REPLACE FUNCTION public.is_assigned_to_client(_employee_id uuid, _client_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.service_requests sr
    JOIN auth.users au ON au.email = sr.email
    WHERE sr.assigned_to = _employee_id
      AND au.id = _client_user_id
  )
$$;

-- Drop old policy
DROP POLICY IF EXISTS "Users can view own profile or staff can view all" ON public.profiles;

-- Recreate with restricted employee access
CREATE POLICY "Users can view own profile or authorized staff"
ON public.profiles
FOR SELECT
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'employee'::app_role) AND is_assigned_to_client(auth.uid(), user_id))
);
