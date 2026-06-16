-- ============================================================
-- NOVA UNPLUGGED — Migration: Add ON DELETE CASCADE to foreign keys
-- ============================================================

-- This fixes the "Database error deleting user" issue in the Supabase Dashboard.
-- When a user is scanned, a record is added to 'scanner_log'. 
-- The database prevents deleting the user because it would leave orphaned scanner logs.
-- This script tells the database to automatically delete associated logs when a user is deleted.

DO $$ 
DECLARE 
  fk_name text;
BEGIN
  -------------------------------------------------------------
  -- 1. Update scanner_log (scanned_by)
  -------------------------------------------------------------
  SELECT constraint_name INTO fk_name 
  FROM information_schema.key_column_usage 
  WHERE table_schema = 'public' AND table_name = 'scanner_log' AND column_name = 'scanned_by';
  
  IF fk_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.scanner_log DROP CONSTRAINT ' || fk_name;
  END IF;

  ALTER TABLE public.scanner_log 
  ADD CONSTRAINT scanner_log_scanned_by_fkey 
  FOREIGN KEY (scanned_by) REFERENCES public.users(id) ON DELETE CASCADE;

  -------------------------------------------------------------
  -- 2. Update scanner_log (target_user_id)
  -------------------------------------------------------------
  SELECT constraint_name INTO fk_name 
  FROM information_schema.key_column_usage 
  WHERE table_schema = 'public' AND table_name = 'scanner_log' AND column_name = 'target_user_id';
  
  IF fk_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.scanner_log DROP CONSTRAINT ' || fk_name;
  END IF;

  ALTER TABLE public.scanner_log 
  ADD CONSTRAINT scanner_log_target_user_id_fkey 
  FOREIGN KEY (target_user_id) REFERENCES public.users(id) ON DELETE CASCADE;

  -------------------------------------------------------------
  -- 3. Update announcements (posted_by)
  -------------------------------------------------------------
  SELECT constraint_name INTO fk_name 
  FROM information_schema.key_column_usage 
  WHERE table_schema = 'public' AND table_name = 'announcements' AND column_name = 'posted_by';
  
  IF fk_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.announcements DROP CONSTRAINT ' || fk_name;
  END IF;

  ALTER TABLE public.announcements 
  ADD CONSTRAINT announcements_posted_by_fkey 
  FOREIGN KEY (posted_by) REFERENCES public.users(id) ON DELETE CASCADE;

END $$;
