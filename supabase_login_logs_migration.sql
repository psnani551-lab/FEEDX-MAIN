-- ============================================================
-- FEEDX: Login Logs Migration
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================

-- 1. Create the login_logs table
CREATE TABLE IF NOT EXISTS public.login_logs (
  id          BIGSERIAL PRIMARY KEY,
  email       TEXT,
  ip_address  TEXT DEFAULT '0.0.0.0',
  user_agent  TEXT,
  success     BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security
ALTER TABLE public.login_logs ENABLE ROW LEVEL SECURITY;

-- 3. Allow admins (authenticated users) to read all logs
CREATE POLICY "Admins can read login_logs"
  ON public.login_logs
  FOR SELECT
  TO authenticated
  USING (true);

-- 4. Allow anyone (including anon) to INSERT (needed for logging sign-in from frontend)
CREATE POLICY "Allow insert login_logs"
  ON public.login_logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- ============================================================
-- 5. (Optional) Auto-log from Supabase Auth audit events
--    This function syncs from auth.audit_log_entries daily.
--    If auth.audit_log_entries is not available in your plan,
--    the frontend insert in SignIn.tsx handles logging instead.
-- ============================================================

-- Function to sync auth audit events to login_logs
CREATE OR REPLACE FUNCTION public.sync_auth_audit_logs()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.login_logs (email, ip_address, created_at, success)
  SELECT
    instance_id::text AS email,
    ip_address,
    created_at,
    (payload->>'action' = 'login') AS success
  FROM auth.audit_log_entries
  WHERE payload->>'action' IN ('login', 'logout')
    AND created_at > NOW() - INTERVAL '24 hours'
  ON CONFLICT DO NOTHING;
EXCEPTION
  WHEN undefined_table THEN
    -- auth.audit_log_entries not available on this plan, skip
    NULL;
END;
$$;

-- 6. Grant appropriate permissions
GRANT SELECT ON public.login_logs TO authenticated;
GRANT INSERT ON public.login_logs TO anon;
GRANT INSERT ON public.login_logs TO authenticated;

-- Done! The frontend (SignIn.tsx) will now insert rows on every login.
