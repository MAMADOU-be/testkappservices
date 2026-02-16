
-- 1. Notify on new user signup (profile created)
CREATE OR REPLACE FUNCTION public.notify_new_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, reference_id)
  VALUES (
    'new_user',
    'Nouveau compte créé',
    COALESCE(NEW.display_name, 'Utilisateur') || ' vient de s''inscrire',
    NEW.id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_new_profile_notify
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_user_signup();

-- 2. Notify on profile update
CREATE OR REPLACE FUNCTION public.notify_profile_updated()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.display_name IS DISTINCT FROM NEW.display_name
     OR OLD.phone IS DISTINCT FROM NEW.phone
     OR OLD.avatar_url IS DISTINCT FROM NEW.avatar_url THEN
    INSERT INTO public.admin_notifications (type, title, message, reference_id)
    VALUES (
      'profile_updated',
      'Profil mis à jour',
      COALESCE(NEW.display_name, 'Utilisateur') || ' a modifié son profil',
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_profile_update_notify
  AFTER UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_profile_updated();

-- 3. Notify on role change
CREATE OR REPLACE FUNCTION public.notify_role_changed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_name TEXT;
  target_user_id UUID;
BEGIN
  target_user_id := COALESCE(NEW.user_id, OLD.user_id);
  SELECT COALESCE(display_name, 'Utilisateur') INTO user_name 
  FROM public.profiles WHERE user_id = target_user_id;

  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.admin_notifications (type, title, message, reference_id)
    VALUES (
      'role_changed',
      'Rôle ajouté',
      user_name || ' a reçu le rôle ' || NEW.role::text,
      NEW.id
    );
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.admin_notifications (type, title, message, reference_id)
    VALUES (
      'role_changed',
      'Rôle retiré',
      user_name || ' a perdu le rôle ' || OLD.role::text,
      OLD.id
    );
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER on_role_change_notify
  AFTER INSERT OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_role_changed();

-- 4. Notify on service request status change
CREATE OR REPLACE FUNCTION public.notify_status_changed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.admin_notifications (type, title, message, reference_id)
    VALUES (
      'status_changed',
      'Statut demande modifié',
      NEW.first_name || ' ' || NEW.last_name || ' : ' || OLD.status || ' → ' || NEW.status,
      NEW.id
    );
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_service_request_status_change_notify
  AFTER UPDATE ON public.service_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_status_changed();
