DO $$
DECLARE
  v_user_id UUID;
  v_event_id UUID;
BEGIN
  -- First, clean up any mistakenly created registrations from the previous script
  DELETE FROM public.registrations 
  WHERE event_id IN (SELECT id FROM public.events WHERE title ILIKE '%Through the Lens%')
  AND user_id IN (SELECT id FROM public.users WHERE full_name ILIKE '%Parth Sarthi%');

  -- Now find the EXACT Parth sarathi using his email
  SELECT id INTO v_user_id 
  FROM public.users 
  WHERE email ILIKE 'parth.sarathi25@iimb.ac%' 
  LIMIT 1;
  
  -- Find the specific event "Through the Lens : Photography Competition"
  SELECT id INTO v_event_id 
  FROM public.events 
  WHERE title ILIKE 'Through the Lens : Photography Competition' 
  LIMIT 1;

  -- Check if both exist
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'User "Parth sarathi" with email parth.sarathi25@... not found in the DB.';
  ELSIF v_event_id IS NULL THEN
    RAISE NOTICE 'Event "Through the Lens : Photography Competition" not found in the DB.';
  ELSE
    -- Insert the registration with the specific date and time (9th June, 2:30 PM)
    INSERT INTO public.registrations (user_id, event_id, created_at)
    VALUES (v_user_id, v_event_id, '2026-06-09 14:30:00+05:30')
    ON CONFLICT (user_id, event_id) 
    DO UPDATE SET created_at = EXCLUDED.created_at;
    
    RAISE NOTICE 'Successfully registered Parth sarathi for "Through the Lens : Photography Competition" on 9th June!';
  END IF;
END $$;
