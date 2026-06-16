-- Create allowed_emails table
CREATE TABLE IF NOT EXISTS public.allowed_emails (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  added_by uuid REFERENCES public.users(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.allowed_emails ENABLE ROW LEVEL SECURITY;

-- Policy: Allow admins to do everything
-- (Assuming permissions_level >= 3 is admin, we'll use a subquery like other tables)
CREATE POLICY "Admins can manage allowed_emails" ON public.allowed_emails
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.users
    JOIN public.user_roles ON users.role_id = user_roles.id
    WHERE users.id = auth.uid() AND user_roles.permissions_level >= 3
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    JOIN public.user_roles ON users.role_id = user_roles.id
    WHERE users.id = auth.uid() AND user_roles.permissions_level >= 3
  )
);

-- Policy: Allow public to SELECT (we need this so the client can verify before registration)
-- Alternatively, we can use the Service Role Key on the server, but allowing public read
-- of just emails is fine or we can just restrict it to service role and query via server action.
-- Let's make it service-role only or admin only, and use server action during registration.
-- For safety, no public policy.
