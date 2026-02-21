-- SAFE SCHEMA FIX FOR LEGACY DATA MIGRATION
-- This script safely adds missing columns and tables without erroring on existing objects.

-- 1. Profiles Table (NEW)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    username TEXT UNIQUE,
    name TEXT,
    email TEXT,
    phone TEXT,
    pin TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'user',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add Missing Columns to Events
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='date') THEN
        ALTER TABLE events ADD COLUMN date DATE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='time') THEN
        ALTER TABLE events ADD COLUMN time TIME;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='is_coming_soon') THEN
        ALTER TABLE events ADD COLUMN is_coming_soon BOOLEAN DEFAULT false;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='events' AND column_name='status') THEN
        ALTER TABLE events ADD COLUMN status TEXT DEFAULT 'upcoming';
    END IF;
END $$;

-- 3. Add Missing Columns to Testimonials
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='testimonials' AND column_name='status') THEN
        ALTER TABLE testimonials ADD COLUMN status TEXT DEFAULT 'published';
    END IF;
END $$;

-- 4. Fix Gallery Table ("order" is a reserved word, quoting it)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='gallery' AND column_name='order') THEN
        ALTER TABLE gallery ADD COLUMN "order" INTEGER DEFAULT 0;
    END IF;
END $$;

-- 5. Fix Login Logs
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='login_logs' AND column_name='username') THEN
        ALTER TABLE login_logs ADD COLUMN username TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='login_logs' AND column_name='user_agent') THEN
        ALTER TABLE login_logs ADD COLUMN user_agent TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='login_logs' AND column_name='login_time') THEN
        ALTER TABLE login_logs ADD COLUMN login_time TIMESTAMPTZ DEFAULT now();
    END IF;
    -- Make email nullable as legacy data uses username
    ALTER TABLE login_logs ALTER COLUMN email DROP NOT NULL;
END $$;

-- 6. Enable RLS on Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 7. Safe Policy Creation (Drop first if exists)
DROP POLICY IF EXISTS "Public Read Profiles" ON profiles;
CREATE POLICY "Public Read Profiles" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin All Profiles" ON profiles;
CREATE POLICY "Admin All Profiles" ON profiles FOR ALL USING (auth.role() = 'authenticated');

-- 8. Migration Policies (Allow public insert for data transfer)
-- Notifications
DROP POLICY IF EXISTS "Migration Insert Notifications" ON notifications;
CREATE POLICY "Migration Insert Notifications" ON notifications FOR INSERT WITH CHECK (true);

-- Updates
DROP POLICY IF EXISTS "Migration Insert Updates" ON updates;
CREATE POLICY "Migration Insert Updates" ON updates FOR INSERT WITH CHECK (true);

-- Resources
DROP POLICY IF EXISTS "Migration Insert Resources" ON resources;
CREATE POLICY "Migration Insert Resources" ON resources FOR INSERT WITH CHECK (true);

-- Events
DROP POLICY IF EXISTS "Migration Insert Events" ON events;
CREATE POLICY "Migration Insert Events" ON events FOR INSERT WITH CHECK (true);

-- Spotlight
DROP POLICY IF EXISTS "Migration Insert Spotlight" ON spotlight;
CREATE POLICY "Migration Insert Spotlight" ON spotlight FOR INSERT WITH CHECK (true);

-- Testimonials
DROP POLICY IF EXISTS "Migration Insert Testimonials" ON testimonials;
CREATE POLICY "Migration Insert Testimonials" ON testimonials FOR INSERT WITH CHECK (true);

-- Gallery
DROP POLICY IF EXISTS "Migration Insert Gallery" ON gallery;
CREATE POLICY "Migration Insert Gallery" ON gallery FOR INSERT WITH CHECK (true);

-- ECET Data
DROP POLICY IF EXISTS "Migration Insert ECET Data" ON ecet_data;
CREATE POLICY "Migration Insert ECET Data" ON ecet_data FOR INSERT WITH CHECK (true);

-- Login Logs
DROP POLICY IF EXISTS "Migration Insert Login Logs" ON login_logs;
CREATE POLICY "Migration Insert Login Logs" ON login_logs FOR INSERT WITH CHECK (true);

-- Profiles
DROP POLICY IF EXISTS "Migration Insert Profiles" ON profiles;
CREATE POLICY "Migration Insert Profiles" ON profiles FOR INSERT WITH CHECK (true);

-- Institutes
DROP POLICY IF EXISTS "Migration Insert Institutes" ON institutes;
CREATE POLICY "Migration Insert Institutes" ON institutes FOR INSERT WITH CHECK (true);

-- Add missing columns to updates table
ALTER TABLE updates ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'announcement';
ALTER TABLE updates ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE updates ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';

-- Correct gallery column name for consistency with API
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Refresh policies for updates
DROP POLICY IF EXISTS "Admin All Updates" ON updates;
CREATE POLICY "Admin All Updates" ON updates FOR ALL USING (auth.role() = 'authenticated');

-- FINAL COMPREHENSIVE SCHEMA FIX
-- Run this in the Supabase SQL Editor

-- 1. Updates Table Fixes
ALTER TABLE updates ADD COLUMN IF NOT EXISTS files JSONB DEFAULT '[]'::jsonb;
ALTER TABLE updates ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'announcement';
ALTER TABLE updates ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE updates ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';

-- 2. Notifications Table Fixes
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';

-- 3. Spotlight Table Fixes
ALTER TABLE spotlight ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';

-- 4. Resources Table Fixes
ALTER TABLE resources ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';

-- 5. Institutes Table Fixes
ALTER TABLE institutes ADD COLUMN IF NOT EXISTS banner_image TEXT;
ALTER TABLE institutes ADD COLUMN IF NOT EXISTS logo_image TEXT;
ALTER TABLE institutes ADD COLUMN IF NOT EXISTS established DATE;

-- 6. Gallery Fix
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Refresh all policies to ensure admin access
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT table_name FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('notifications', 'updates', 'resources', 'events', 'spotlight', 'testimonials', 'gallery', 'institutes', 'subscriptions', 'contact_messages')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS "Admin All %I" ON %I', t, t);
        EXECUTE format('CREATE POLICY "Admin All %I" ON %I FOR ALL USING (auth.role() = ''authenticated'')', t, t);
    END LOOP;
END $$;
