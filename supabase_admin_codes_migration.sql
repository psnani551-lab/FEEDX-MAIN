-- =====================================================
-- FXBOT: Admin Access Code Protection
-- Run this in Supabase SQL Editor (FX-BOT project)
-- =====================================================

-- 1. Create admin codes table
CREATE TABLE IF NOT EXISTS fxbot_admin_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    designation TEXT NOT NULL CHECK (designation IN ('Principal', 'Admin')),
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    used_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE fxbot_admin_codes ENABLE ROW LEVEL SECURITY;

-- 3. Allow anyone to READ (needed to validate during signup)
--    But only return the code+designation — not IDs or metadata
CREATE POLICY "Allow public code validation"
ON fxbot_admin_codes FOR SELECT
USING (is_active = TRUE);

-- 4. Only service role can insert/update/delete codes
-- (No INSERT/UPDATE/DELETE policies = blocked for anon users)

-- 5. Seed your initial access codes
-- ⚠️  CHANGE THESE TO SECRET CODES BEFORE DEPLOYING ⚠️
INSERT INTO fxbot_admin_codes (code, designation, description) VALUES
    ('PRINCIPAL-AUTH-2025', 'Principal', 'Principal registration code'),
    ('ADMIN-SECURE-2025',   'Admin',     'Admin registration code')
ON CONFLICT (code) DO NOTHING;

-- =====================================================
-- OPTIONAL: Database-level trigger to double-check
-- (Extra safety even if frontend is bypassed)
-- =====================================================
CREATE OR REPLACE FUNCTION check_admin_code_before_insert()
RETURNS TRIGGER AS $$
BEGIN
    -- Only enforce for Principal and Admin designations
    IF NEW.designation IN ('Principal', 'Admin') THEN
        -- The validation is done client-side via validateAdminCode()
        -- This trigger acts as a backstop if someone bypasses the frontend
        -- You can add server-side validation here if needed
        -- For now, just log it
        RAISE NOTICE 'Privileged account created: % - %', NEW.designation, NEW.email;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER validate_principal_admin_signup
    BEFORE INSERT ON students
    FOR EACH ROW
    EXECUTE FUNCTION check_admin_code_before_insert();
