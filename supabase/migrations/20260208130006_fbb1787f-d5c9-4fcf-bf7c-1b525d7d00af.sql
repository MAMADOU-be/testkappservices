
-- Function for admins to add a role to a user
CREATE OR REPLACE FUNCTION public.admin_add_role(_target_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can call this
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  -- Insert role if not exists
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_target_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN TRUE;
END;
$$;

-- Function for admins to remove a role from a user
CREATE OR REPLACE FUNCTION public.admin_remove_role(_target_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can call this
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  -- Prevent removing admin role from yourself
  IF _target_user_id = auth.uid() AND _role = 'admin' THEN
    RAISE EXCEPTION 'Cannot remove your own admin role';
  END IF;
  
  DELETE FROM public.user_roles
  WHERE user_id = _target_user_id AND role = _role;
  
  RETURN TRUE;
END;
$$;
