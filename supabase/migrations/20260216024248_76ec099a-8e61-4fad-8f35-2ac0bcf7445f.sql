-- Add next_appointment column for scheduling reminders
ALTER TABLE public.service_requests 
ADD COLUMN next_appointment TIMESTAMP WITH TIME ZONE;

-- Enable pg_cron and pg_net for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA pg_catalog;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Index for efficient reminder queries
CREATE INDEX idx_service_requests_next_appointment 
ON public.service_requests (next_appointment) 
WHERE next_appointment IS NOT NULL AND status IN ('confirmed', 'in_progress');