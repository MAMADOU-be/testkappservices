-- Fix: Drop restrictive policies and recreate as PERMISSIVE so either condition works
DROP POLICY IF EXISTS "Staff can view contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Users can view own contact messages" ON public.contact_messages;

CREATE POLICY "Staff can view contact messages"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'employee'::app_role));

CREATE POLICY "Users can view own contact messages"
ON public.contact_messages
FOR SELECT
TO authenticated
USING (email = get_auth_email());