
-- Fix process_referral: add guard against double-referral and race conditions
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
  -- Find the referrer by their code
  SELECT user_id INTO referrer_user_id
  FROM public.profiles
  WHERE referral_code = _referral_code;
  
  IF referrer_user_id IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Prevent self-referral
  IF referrer_user_id = _referred_user_id THEN
    RETURN FALSE;
  END IF;
  
  -- Check if user was already referred (prevent double-referral)
  SELECT referred_by INTO existing_referrer
  FROM public.profiles
  WHERE user_id = _referred_user_id;
  
  IF existing_referrer IS NOT NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Update the referred user's profile
  UPDATE public.profiles
  SET referred_by = referrer_user_id
  WHERE user_id = _referred_user_id
    AND referred_by IS NULL;  -- Additional guard against race conditions
  
  -- Only create referral record if profile was actually updated
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  -- Create the referral record (use INSERT only, no upsert)
  INSERT INTO public.referrals (referrer_id, referred_id, referral_code, status, completed_at)
  VALUES (referrer_user_id, _referred_user_id, _referral_code, 'completed', now());
  
  RETURN TRUE;
END;
$function$;
