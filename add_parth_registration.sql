DO $$
DECLARE
  v_user_id UUID;
  v_event_id UUID;
BEGIN
  -- Find Parth Sarthi's user ID
  SELECT id INTO v_user_id 
  FROM public.users 
  WHERE full_name ILIKE '%Parth Sarthi%' 
  LIMIT 1;
  
  -- Find the Photography competition event ID
  SELECT id INTO v_event_id 
  FROM public.events 
  WHERE title ILIKE '%Photo%' OR title ILIKE '%graphy%' 
  LIMIT 1;

  -- Check if both exist
  IF v_user_id IS NULL THEN
    RAISE NOTICE 'User Parth Sarthi not found in the DB.';
  ELSIF v_event_id IS NULL THEN
    RAISE NOTICE 'Photography competition not found in the DB.';
  ELSE
    -- Insert the registration with the specific date and time (9th June)
    INSERT INTO public.registrations (user_id, event_id, created_at)
    VALUES (v_user_id, v_event_id, '2026-06-09 14:30:00+05:30')
    ON CONFLICT (user_id, event_id) 
    DO UPDATE SET created_at = EXCLUDED.created_at;
    
    RAISE NOTICE 'Successfully registered Parth Sarthi for the Photography competition on 9th June!';
  END IF;
END $$;
