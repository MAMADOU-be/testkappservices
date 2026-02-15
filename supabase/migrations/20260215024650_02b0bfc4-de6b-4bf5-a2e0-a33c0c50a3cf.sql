
-- Create reviews table
CREATE TABLE public.reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_request_id UUID NOT NULL,
  user_id UUID NOT NULL,
  employee_id UUID,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add unique constraint: one review per service request
ALTER TABLE public.reviews ADD CONSTRAINT reviews_service_request_unique UNIQUE (service_request_id);

-- Enable RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Users can view their own reviews
CREATE POLICY "Users can view own reviews"
  ON public.reviews FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create reviews for their own completed service requests
CREATE POLICY "Users can create reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.service_requests sr
      JOIN auth.users au ON au.email = sr.email
      WHERE sr.id = service_request_id
        AND au.id = auth.uid()
        AND sr.status = 'completed'
    )
  );

-- Staff can view all reviews
CREATE POLICY "Staff can view all reviews"
  ON public.reviews FOR SELECT
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'employee'::app_role)
  );

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Admins can delete reviews
CREATE POLICY "Admins can delete reviews"
  ON public.reviews FOR DELETE
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for reviews
ALTER PUBLICATION supabase_realtime ADD TABLE public.reviews;
