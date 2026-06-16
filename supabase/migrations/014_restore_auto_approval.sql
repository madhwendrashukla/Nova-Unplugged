-- Restore Auto Approval and QR Generation Logic
-- Incorporates the Gmail pivot changes (using iimb_email from metadata) but restores the logic
-- from migration 007 that instantly approves users and generates their entry code.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_type_id UUID;
  v_role_id UUID;
  v_email TEXT;
  v_is_allowed BOOLEAN;
  v_payment_status TEXT := 'pending';
  v_entry_status TEXT := 'not_approved';
  v_entry_code TEXT := NULL;
BEGIN
  -- Use iimb_email from metadata if it exists, otherwise fall back to the auth email (which is the gmail)
  v_email := COALESCE(NEW.raw_user_meta_data->>'iimb_email', NEW.email);

  -- 1. Check if user is in allowed_emails using their actual IIMB email
  SELECT EXISTS(
    SELECT 1 FROM public.allowed_emails 
    WHERE lower(trim(email)) = lower(trim(v_email))
  ) INTO v_is_allowed;

  -- 2. If allowed, instantly approve and generate code
  IF v_is_allowed THEN
    v_payment_status := 'approved';
    v_entry_status := 'approved';
    v_entry_code := public.generate_8_digit_alphanumeric();
  END IF;

  -- 3. Get roles and types
  SELECT id INTO v_type_id FROM public.user_types WHERE name = COALESCE(NEW.raw_user_meta_data->>'user_type', 'iimb_student');
  SELECT id INTO v_role_id  FROM public.user_roles  WHERE name = 'student';

  -- 4. Insert into public.users with final statuses
  INSERT INTO public.users (
    id, full_name, email, phone, pincode, state, city, batch, zone, type_id, role_id, payment_status, entry_status, entry_code
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    v_email,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'pincode',
    NEW.raw_user_meta_data->>'state',
    NEW.raw_user_meta_data->>'city',
    NEW.raw_user_meta_data->>'batch',
    NEW.raw_user_meta_data->>'zone',
    v_type_id,
    v_role_id,
    v_payment_status,
    v_entry_status,
    v_entry_code
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
