-- Allow users to delete their own profile
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);

-- Allow users to update their own pending referrals
CREATE POLICY "Users can update their own referrals"
ON public.referrals
FOR UPDATE
USING (referrer_id = auth.uid() AND status = 'pending')
WITH CHECK (referrer_id = auth.uid());

-- Allow users to delete their own pending referrals
CREATE POLICY "Users can delete their own referrals"
ON public.referrals
FOR DELETE
USING (referrer_id = auth.uid() AND status = 'pending');