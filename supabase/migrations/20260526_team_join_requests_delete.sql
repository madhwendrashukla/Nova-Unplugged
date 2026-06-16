-- ============================================================
-- NOVA UNPLUGGED — Migration: Team Join Requests Delete Policy
-- ============================================================

-- Users can delete their own join requests if they are still pending
DROP POLICY IF EXISTS "Users can delete own pending requests" ON public.team_join_requests;
CREATE POLICY "Users can delete own pending requests" ON public.team_join_requests 
  FOR DELETE USING (auth.uid() = user_id AND status = 'pending');
