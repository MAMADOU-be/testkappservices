-- Create referrals table to track referral relationships
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'expired')),
  referred_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Add referral_code column to profiles for quick access
ALTER TABLE public.profiles ADD COLUMN referral_code TEXT UNIQUE;

-- Add referred_by column to profiles to track who referred the user
ALTER TABLE public.profiles ADD COLUMN referred_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referral_code ON public.referrals(referral_code);
CREATE INDEX idx_profiles_referral_code ON public.profiles(referral_code);

-- Enable RLS on referrals table
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referrals
-- Users can view their own referrals (as referrer)
CREATE POLICY "Users can view their own referrals"
ON public.referrals
FOR SELECT
USING (referrer_id = auth.uid());

-- Users can create referral entries for themselves
CREATE POLICY "Users can create their own referrals"
ON public.referrals
FOR INSERT
WITH CHECK (referrer_id = auth.uid());

-- Admins can view all referrals
CREATE POLICY "Admins can view all referrals"
ON public.referrals
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage all referrals
CREATE POLICY "Admins can manage all referrals"
ON public.referrals
FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Function to generate unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate 8 character alphanumeric code
    new_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS (
      SELECT 1 FROM public.profiles WHERE referral_code = new_code
      UNION
      SELECT 1 FROM public.referrals WHERE referral_code = new_code
    ) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Function to initialize referral code for user if not exists
CREATE OR REPLACE FUNCTION public.ensure_referral_code(_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_code TEXT;
  new_code TEXT;
BEGIN
  -- Check if user already has a referral code
  SELECT referral_code INTO existing_code
  FROM public.profiles
  WHERE user_id = _user_id;
  
  IF existing_code IS NOT NULL THEN
    RETURN existing_code;
  END IF;
  
  -- Generate new code
  new_code := public.generate_referral_code();
  
  -- Update profile with new code
  UPDATE public.profiles
  SET referral_code = new_code
  WHERE user_id = _user_id;
  
  RETURN new_code;
END;
$$;

-- Function to process referral when a new user signs up with a referral code
CREATE OR REPLACE FUNCTION public.process_referral(_referred_user_id UUID, _referral_code TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referrer_user_id UUID;
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
  
  -- Update the referred user's profile
  UPDATE public.profiles
  SET referred_by = referrer_user_id
  WHERE user_id = _referred_user_id;
  
  -- Create or update the referral record
  INSERT INTO public.referrals (referrer_id, referred_id, referral_code, status, completed_at)
  VALUES (referrer_user_id, _referred_user_id, _referral_code, 'completed', now())
  ON CONFLICT (referral_code) 
  DO UPDATE SET 
    referred_id = _referred_user_id,
    status = 'completed',
    completed_at = now();
  
  RETURN TRUE;
END;
$$;

-- Function to get referral statistics for a user
CREATE OR REPLACE FUNCTION public.get_referral_stats(_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_referrals INTEGER;
  completed_referrals INTEGER;
  pending_referrals INTEGER;
  result JSON;
BEGIN
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
$$;

-- Enable realtime for referrals
ALTER PUBLICATION supabase_realtime ADD TABLE public.referrals;