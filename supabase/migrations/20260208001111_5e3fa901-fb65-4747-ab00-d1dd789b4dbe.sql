-- Create a SECURITY DEFINER function to add a chat participant
-- This bypasses RLS and validates auth server-side
CREATE OR REPLACE FUNCTION public.join_chat_room(
  p_room_id uuid,
  p_display_name text,
  p_role text DEFAULT 'client'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_participant json;
BEGIN
  -- Get the authenticated user
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Validate role
  IF p_role NOT IN ('client', 'employee') THEN
    RAISE EXCEPTION 'Invalid role';
  END IF;

  -- Check if already a participant
  SELECT row_to_json(cp.*) INTO v_participant
  FROM public.chat_participants cp
  WHERE cp.room_id = p_room_id AND cp.user_id = v_user_id;

  IF v_participant IS NOT NULL THEN
    -- Update online status
    UPDATE public.chat_participants
    SET is_online = true, last_seen_at = now()
    WHERE room_id = p_room_id AND user_id = v_user_id;

    -- Return updated participant
    SELECT row_to_json(cp.*) INTO v_participant
    FROM public.chat_participants cp
    WHERE cp.room_id = p_room_id AND cp.user_id = v_user_id;

    RETURN v_participant;
  END IF;

  -- Insert new participant
  INSERT INTO public.chat_participants (room_id, user_id, display_name, role, is_online)
  VALUES (p_room_id, v_user_id, p_display_name, p_role, true);

  SELECT row_to_json(cp.*) INTO v_participant
  FROM public.chat_participants cp
  WHERE cp.room_id = p_room_id AND cp.user_id = v_user_id;

  RETURN v_participant;
END;
$$;

-- Also create a function to create a room and join it atomically
CREATE OR REPLACE FUNCTION public.create_chat_room_and_join(
  p_room_name text,
  p_display_name text,
  p_role text DEFAULT 'client'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
  v_room_id uuid;
  v_result json;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  -- Check if user already has a room as client
  IF p_role = 'client' THEN
    SELECT cp.room_id INTO v_room_id
    FROM public.chat_participants cp
    WHERE cp.user_id = v_user_id AND cp.role = 'client'
    LIMIT 1;

    IF v_room_id IS NOT NULL THEN
      -- Update online status and return existing room
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

  -- Create new room
  INSERT INTO public.chat_rooms (name)
  VALUES (p_room_name)
  RETURNING id INTO v_room_id;

  -- Add participant
  INSERT INTO public.chat_participants (room_id, user_id, display_name, role, is_online)
  VALUES (v_room_id, v_user_id, p_display_name, p_role, true);

  -- Return result
  SELECT json_build_object(
    'room', row_to_json(r.*),
    'participant', row_to_json(cp.*)
  ) INTO v_result
  FROM public.chat_rooms r
  JOIN public.chat_participants cp ON cp.room_id = r.id AND cp.user_id = v_user_id
  WHERE r.id = v_room_id;

  RETURN v_result;
END;
$$;

-- Clean orphan rooms
DELETE FROM public.chat_rooms
WHERE id NOT IN (SELECT DISTINCT room_id FROM public.chat_participants);
