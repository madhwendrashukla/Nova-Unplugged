-- ============================================================
-- NOVA UNPLUGGED — Migration 012: Add Event Submission Link
-- ============================================================

-- Add submission_link column to events table to store Google Forms or MS Forms links
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS submission_link TEXT;
