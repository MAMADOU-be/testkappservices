
-- FIX 1: user_can_access_room returns true for anonymous users - fix it
CREATE OR REPLACE FUNCTION public.user_can_access_room(check_room_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Require authentication
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;

  -- Check if the current authenticated user is a participant in this room
  RETURN EXISTS (
    SELECT 1 FROM public.chat_participants
    WHERE room_id = check_room_id
    AND user_id = auth.uid()
  );
END;
$function$;

-- FIX 2: Profiles SELECT policy too permissive - restrict to own profile + staff
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Users can view own profile or staff can view all"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = user_id
    OR public.has_role(auth.uid(), 'admin'::app_role)
    OR public.has_role(auth.uid(), 'employee'::app_role)
  );

-- FIX 3: Employee role escalation - validate role in RPC functions
CREATE OR REPLACE FUNCTION public.create_chat_room_and_join(p_room_name text, p_display_name text, p_role text DEFAULT 'client'::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_room_id uuid;
  v_result json;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Validate role format
  IF p_role NOT IN ('client', 'employee') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  -- Validate employee role against user_roles table
  IF p_role = 'employee' THEN
    IF NOT (public.has_role(v_user_id, 'employee') OR public.has_role(v_user_id, 'admin')) THEN
      RAISE EXCEPTION 'Insufficient privileges for employee role';
    END IF;
  END IF;

  -- Check if user already has a room as client
  IF p_role = 'client' THEN
    SELECT cp.room_id INTO v_room_id
    FROM public.chat_participants cp
    WHERE cp.user_id = v_user_id AND cp.role = 'client'
    LIMIT 1;

    IF v_room_id IS NOT NULL THEN
      UPDATE public.chat_participants
      SET is_online = true, last_seen_at = now()
      WHERE room_id = v_room_id AND user_id = v_user_id;

      SELECT json_build_object(
        'room', row_to_json(r.*),
        'participant', row_to_json(cp.*)
      ) INTO v_result
      FROM public.chat_rooms r
      JOIN public.chat_participants cp ON cp.room_id = r.id AND cp.user_id = v_user_id
      WHERE r.id = v_room_id;

      RETURN v_result;
    END IF;
  END IF;

  INSERT INTO public.chat_rooms (name)
  VALUES (p_room_name)
  RETURNING id INTO v_room_id;

  INSERT INTO public.chat_participants (room_id, user_id, display_name, role, is_online)
  VALUES (v_room_id, v_user_id, p_display_name, p_role, true);

  SELECT json_build_object(
    'room', row_to_json(r.*),
    'participant', row_to_json(cp.*)
  ) INTO v_result
  FROM public.chat_rooms r
  JOIN public.chat_participants cp ON cp.room_id = r.id AND cp.user_id = v_user_id
  WHERE r.id = v_room_id;

  RETURN v_result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.join_chat_room(p_room_id uuid, p_display_name text, p_role text DEFAULT 'client'::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_user_id uuid;
  v_participant json;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Validate role format
  IF p_role NOT IN ('client', 'employee') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  -- Validate employee role against user_roles table
  IF p_role = 'employee' THEN
    IF NOT (public.has_role(v_user_id, 'employee') OR public.has_role(v_user_id, 'admin')) THEN
      RAISE EXCEPTION 'Insufficient privileges for employee role';
    END IF;
  END IF;

  -- Check if already a participant
  SELECT row_to_json(cp.*) INTO v_participant
  FROM public.chat_participants cp
  WHERE cp.room_id = p_room_id AND cp.user_id = v_user_id;

  IF v_participant IS NOT NULL THEN
    UPDATE public.chat_participants
    SET is_online = true, last_seen_at = now()
    WHERE room_id = p_room_id AND user_id = v_user_id;

    SELECT row_to_json(cp.*) INTO v_participant
    FROM public.chat_participants cp
    WHERE cp.room_id = p_room_id AND cp.user_id = v_user_id;

    RETURN v_participant;
  END IF;

  INSERT INTO public.chat_participants (room_id, user_id, display_name, role, is_online)
  VALUES (p_room_id, v_user_id, p_display_name, p_role, true);

  SELECT row_to_json(cp.*) INTO v_participant
  FROM public.chat_participants cp
  WHERE cp.room_id = p_room_id AND cp.user_id = v_user_id;

  RETURN v_participant;
END;
$function$;
