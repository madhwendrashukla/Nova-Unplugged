-- ============================================================
-- NOVA UNPLUGGED — Migration 012: Submission-Based Events
-- ============================================================

-- Add is_submission_based column to events table
ALTER TABLE public.events 
ADD COLUMN IF NOT EXISTS is_submission_based BOOLEAN NOT NULL DEFAULT false;

-- Add submission_link column to registrations table
ALTER TABLE public.registrations 
ADD COLUMN IF NOT EXISTS submission_link TEXT;
