-- Function to create admin notification on new service request
CREATE OR REPLACE FUNCTION public.notify_new_service_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, reference_id)
  VALUES (
    'service_request',
    'Nouvelle demande de service',
    NEW.first_name || ' ' || NEW.last_name || ' a envoyé une demande',
    NEW.id
  );
  RETURN NEW;
END;
$$;

-- Function to create admin notification on new job application
CREATE OR REPLACE FUNCTION public.notify_new_job_application()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, reference_id)
  VALUES (
    'job_application',
    'Nouvelle candidature',
    NEW.first_name || ' ' || NEW.last_name || ' a postulé',
    NEW.id
  );
  RETURN NEW;
END;
$$;

-- Create triggers
CREATE TRIGGER on_new_service_request
  AFTER INSERT ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_service_request();

CREATE TRIGGER on_new_job_application
  AFTER INSERT ON public.job_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_job_application();
