-- Policy: Allow authenticated users to read their own email from allowed_emails
CREATE POLICY "Users can read own allowed_email" ON public.allowed_emails
FOR SELECT TO authenticated USING (email = auth.jwt()->>'email');
