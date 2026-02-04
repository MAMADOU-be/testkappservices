-- Tighten INSERT policies to avoid always-true checks while keeping intended behavior

-- chat_rooms: allow creation but require a reasonable name
DROP POLICY IF EXISTS "Anyone can create chat rooms" ON public.chat_rooms;
CREATE POLICY "Anyone can create chat rooms"
ON public.chat_rooms
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (
  name IS NOT NULL
  AND length(name) <= 200
);

-- service_requests: allow public creation but require basic non-empty fields
DROP POLICY IF EXISTS "Anyone can create service requests" ON public.service_requests;
CREATE POLICY "Anyone can create service requests"
ON public.service_requests
AS PERMISSIVE
FOR INSERT
TO public
WITH CHECK (
  email <> ''
  AND phone <> ''
  AND first_name <> ''
  AND last_name <> ''
  AND city <> ''
  AND street <> ''
  AND postal_code <> ''
  AND service_type <> ''
  AND frequency <> ''
);
