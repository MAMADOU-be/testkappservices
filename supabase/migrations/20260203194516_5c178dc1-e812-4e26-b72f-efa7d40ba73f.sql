-- Create table for service requests
CREATE TABLE public.service_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Client info
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  
  -- Address
  street TEXT NOT NULL,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  
  -- Service details
  service_type TEXT NOT NULL,
  frequency TEXT NOT NULL,
  preferred_day TEXT,
  preferred_time TEXT,
  comments TEXT,
  
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_to UUID REFERENCES auth.users(id),
  notes TEXT
);

-- Enable RLS
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

-- Admins and employees can view all requests
CREATE POLICY "Staff can view all service requests"
ON public.service_requests
FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'employee'));

-- Admins and employees can update requests
CREATE POLICY "Staff can update service requests"
ON public.service_requests
FOR UPDATE
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'employee'));

-- Anyone can create a service request (public form)
CREATE POLICY "Anyone can create service requests"
ON public.service_requests
FOR INSERT
WITH CHECK (true);

-- Only admins can delete requests
CREATE POLICY "Admins can delete service requests"
ON public.service_requests
FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- Add trigger for updated_at
CREATE TRIGGER update_service_requests_updated_at
BEFORE UPDATE ON public.service_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();