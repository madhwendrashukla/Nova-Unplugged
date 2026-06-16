-- Add gmail column to allowed_emails
ALTER TABLE public.allowed_emails
ADD COLUMN IF NOT EXISTS gmail text;

-- Update the handle_new_user function to use iimb_email if provided in metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_type_id UUID;
  v_role_id UUID;
  v_email TEXT;
BEGIN
  SELECT id INTO v_type_id FROM public.user_types WHERE name = COALESCE(NEW.raw_user_meta_data->>'user_type', 'iimb_student');
  SELECT id INTO v_role_id  FROM public.user_roles  WHERE name = 'student';

  -- Use iimb_email from metadata if it exists, otherwise fall back to the auth email (which is the gmail)
  v_email := COALESCE(NEW.raw_user_meta_data->>'iimb_email', NEW.email);

  INSERT INTO public.users (
    id, full_name, email, phone, pincode, state, city, batch, zone, type_id, role_id
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
    v_role_id
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
