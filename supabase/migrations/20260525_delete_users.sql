-- Script to delete all users EXCEPT 'madhwendra.shukla25@iimb.ac.in'

DO $$
DECLARE
  keep_uid uuid;
  super_admin_role_id uuid;
BEGIN
  -- 1. Get the ID of the user we want to keep
  SELECT id INTO keep_uid FROM auth.users WHERE email = 'madhwendra.shukla25@iimb.ac.in';
  
  -- 2. Get the super_admin role ID
  SELECT id INTO super_admin_role_id FROM public.user_roles WHERE name = 'super_admin';
  
  -- 3. Update the kept user to super_admin and approved status
  IF keep_uid IS NOT NULL THEN
    UPDATE public.users 
    SET role_id = super_admin_role_id, payment_status = 'approved' 
    WHERE id = keep_uid;
  END IF;

  -- 4. Delete all dependent records for other users to prevent Foreign Key constraint errors
  DELETE FROM public.registrations WHERE user_id != keep_uid OR user_id IS NULL;
  DELETE FROM public.team_join_requests WHERE user_id != keep_uid OR user_id IS NULL;
  DELETE FROM public.team_members WHERE user_id != keep_uid OR user_id IS NULL;
  DELETE FROM public.payment_submissions WHERE user_id != keep_uid OR user_id IS NULL;
  DELETE FROM public.scanner_log WHERE target_user_id != keep_uid OR target_user_id IS NULL;
  
  -- Reassign ownership of events/teams to the super admin so we don't lose the events
  UPDATE public.events SET created_by = keep_uid WHERE created_by != keep_uid;
  UPDATE public.teams SET leader_id = keep_uid WHERE leader_id != keep_uid;
  UPDATE public.scanner_log SET scanned_by = keep_uid WHERE scanned_by != keep_uid;
  UPDATE public.allowed_emails SET added_by = keep_uid WHERE added_by != keep_uid;
  UPDATE public.announcements SET posted_by = keep_uid WHERE posted_by != keep_uid;

  -- 5. Finally, delete all other users
  DELETE FROM public.users WHERE id != keep_uid;
  DELETE FROM auth.users WHERE id != keep_uid;
  
END $$;
