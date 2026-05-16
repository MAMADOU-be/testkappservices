
-- 1. Tighten service_requests UPDATE policy
DROP POLICY IF EXISTS "Staff can update service requests" ON public.service_requests;
CREATE POLICY "Staff can update service requests"
ON public.service_requests
FOR UPDATE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'employee'::app_role) AND assigned_to = auth.uid())
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR (has_role(auth.uid(), 'employee'::app_role) AND assigned_to = auth.uid())
);

-- 2. Remove public INSERT policies for forms (force routing via edge functions)
DROP POLICY IF EXISTS "Anyone can create service requests" ON public.service_requests;
DROP POLICY IF EXISTS "Anyone can create job applications" ON public.job_applications;
DROP POLICY IF EXISTS "Anyone can create contact messages" ON public.contact_messages;

-- 3. Re-scope contact_messages staff policies to authenticated role
DROP POLICY IF EXISTS "Staff can update contact messages" ON public.contact_messages;
CREATE POLICY "Staff can update contact messages"
ON public.contact_messages
FOR UPDATE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'employee'::app_role));

DROP POLICY IF EXISTS "Admins can delete contact messages" ON public.contact_messages;
CREATE POLICY "Admins can delete contact messages"
ON public.contact_messages
FOR DELETE
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- 4. Patch process_referral to require ownership
CREATE OR REPLACE FUNCTION public.process_referral(_referred_user_id uuid, _referral_code text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  referrer_user_id UUID;
  existing_referrer UUID;
BEGIN
  -- Ownership guard
  IF _referred_user_id != auth.uid() THEN
    RAISE EXCEPTION 'Cannot process referral for another user';
  END IF;

  SELECT user_id INTO referrer_user_id
  FROM public.profiles
  WHERE referral_code = _referral_code;

  IF referrer_user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  IF referrer_user_id = _referred_user_id THEN
    RETURN FALSE;
  END IF;

  SELECT referred_by INTO existing_referrer
  FROM public.profiles
  WHERE user_id = _referred_user_id;

  IF existing_referrer IS NOT NULL THEN
    RETURN FALSE;
  END IF;

  UPDATE public.profiles
  SET referred_by = referrer_user_id
  WHERE user_id = _referred_user_id
    AND referred_by IS NULL;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  INSERT INTO public.referrals (referrer_id, referred_id, referral_code, status, completed_at)
  VALUES (referrer_user_id, _referred_user_id, _referral_code, 'completed', now());

  RETURN TRUE;
END;
$function$;

-- 5. Patch ensure_referral_code with ownership guard
CREATE OR REPLACE FUNCTION public.ensure_referral_code(_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  existing_code TEXT;
  new_code TEXT;
BEGIN
  IF _user_id != auth.uid() AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT referral_code INTO existing_code
  FROM public.profiles
  WHERE user_id = _user_id;

  IF existing_code IS NOT NULL THEN
    RETURN existing_code;
  END IF;

  new_code := public.generate_referral_code();

  UPDATE public.profiles
  SET referral_code = new_code
  WHERE user_id = _user_id;

  RETURN new_code;
END;
$function$;

-- 6. Patch get_referral_stats with ownership guard
CREATE OR REPLACE FUNCTION public.get_referral_stats(_user_id uuid)
RETURNS json
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  total_referrals INTEGER;
  completed_referrals INTEGER;
  pending_referrals INTEGER;
  result JSON;
BEGIN
  IF _user_id != auth.uid() AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT
    COUNT(*),
    COUNT(*) FILTER (WHERE status = 'completed'),
    COUNT(*) FILTER (WHERE status = 'pending')
  INTO total_referrals, completed_referrals, pending_referrals
  FROM public.referrals
  WHERE referrer_id = _user_id;

  SELECT json_build_object(
    'total', COALESCE(total_referrals, 0),
    'completed', COALESCE(completed_referrals, 0),
    'pending', COALESCE(pending_referrals, 0)
  ) INTO result;

  RETURN result;
END;
$function$;

-- 7. Patch get_user_roles with ownership guard
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id uuid)
RETURNS SETOF app_role
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF _user_id != auth.uid() AND NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  RETURN QUERY
    SELECT role FROM public.user_roles WHERE user_id = _user_id;
END;
$function$;

-- 8. Revoke public EXECUTE on internal SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_assigned_to_client(uuid, uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_auth_email() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.get_public_testimonials() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_public_testimonials() TO anon, authenticated;

-- 9. Enable RLS on realtime.messages to default-deny channel subscriptions
ALTER TABLE IF EXISTS realtime.messages ENABLE ROW LEVEL SECURITY;
