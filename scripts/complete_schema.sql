-- FEEDX MAIN WEBSITE SCHEMA (FINALIZED & IDEMPOTENT)
-- This script is SAFE to run on an existing database.
-- It will:
-- 1. Create tables if they don't exist.
-- 2. Add missing columns to existing tables (using ALTER TABLE).
-- 3. Update Policies (Drop & Recreate) to ensure permissions are correct.

-- ==========================================
-- 1. Notifications Table
-- ==========================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Update existing table
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';


-- ==========================================
-- 2. Updates Table
-- ==========================================
CREATE TABLE IF NOT EXISTS updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  files JSONB DEFAULT '[]'::jsonb,
  priority TEXT DEFAULT 'medium',
  type TEXT DEFAULT 'announcement',
  category TEXT DEFAULT 'General',
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Update existing table
ALTER TABLE updates ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
ALTER TABLE updates ADD COLUMN IF NOT EXISTS files JSONB DEFAULT '[]'::jsonb;
ALTER TABLE updates ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'announcement';
ALTER TABLE updates ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';
ALTER TABLE updates ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';


-- ==========================================
-- 3. Resources Table
-- ==========================================
CREATE TABLE IF NOT EXISTS resources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  long_description TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  files JSONB DEFAULT '[]'::jsonb,
  images JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Update existing table
ALTER TABLE resources ADD COLUMN IF NOT EXISTS long_description TEXT;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS files JSONB DEFAULT '[]'::jsonb;
ALTER TABLE resources ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';


-- ==========================================
-- 4. Events Table
-- ==========================================
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT,
  date TEXT, -- Changed to TEXT to support "Coming Soon"
  time TEXT, -- Changed to TEXT to support "TBA"
  location TEXT,
  register_link TEXT,
  is_coming_soon BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'upcoming',
  admin_status TEXT DEFAULT 'published', -- Added missing column
  files JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Update existing table
ALTER TABLE events ALTER COLUMN date TYPE TEXT;
ALTER TABLE events ALTER COLUMN time TYPE TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS admin_status TEXT DEFAULT 'published';
ALTER TABLE events ADD COLUMN IF NOT EXISTS register_link TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_coming_soon BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'upcoming';
ALTER TABLE events ADD COLUMN IF NOT EXISTS files JSONB DEFAULT '[]'::jsonb;


-- ==========================================
-- 5. Spotlight Table
-- ==========================================
CREATE TABLE IF NOT EXISTS spotlight (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  images JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Update existing table
ALTER TABLE spotlight ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';


-- ==========================================
-- 6. Testimonials Table
-- ==========================================
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image TEXT,
  status TEXT DEFAULT 'published',
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Update existing table
ALTER TABLE testimonials ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'published';


-- ==========================================
-- 7. Gallery Table
-- ==========================================
CREATE TABLE IF NOT EXISTS gallery (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  caption TEXT,
  category TEXT DEFAULT 'General',
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Update existing table
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS caption TEXT;
ALTER TABLE gallery ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'General';


-- ==========================================
-- 8. Appearance Settings
-- ==========================================
-- Using double quotes for camelCase columns to match frontend usage
CREATE TABLE IF NOT EXISTS appearance (
  id TEXT PRIMARY KEY DEFAULT 'settings',
  primary_color TEXT DEFAULT '#0ea5e9',
  secondary_color TEXT DEFAULT '#f59e0b',
  "primaryColor" TEXT DEFAULT '#3b82f6',
  "glowIntensity" FLOAT DEFAULT 0.25,
  "glassContrast" FLOAT DEFAULT 0.1,
  "brandingName" TEXT DEFAULT 'FeedX Portal',
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE appearance ADD COLUMN IF NOT EXISTS "primaryColor" TEXT DEFAULT '#3b82f6';
ALTER TABLE appearance ADD COLUMN IF NOT EXISTS "glowIntensity" FLOAT DEFAULT 0.25;
ALTER TABLE appearance ADD COLUMN IF NOT EXISTS "glassContrast" FLOAT DEFAULT 0.1;
ALTER TABLE appearance ADD COLUMN IF NOT EXISTS "brandingName" TEXT DEFAULT 'FeedX Portal';

-- ==========================================
-- 9. ECET Data
-- ==========================================
CREATE TABLE IF NOT EXISTS ecet_data (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL, 
  title TEXT NOT NULL,
  content JSONB DEFAULT '{}'::jsonb,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);


-- ==========================================
-- 10. Login Logs
-- ==========================================
CREATE TABLE IF NOT EXISTS login_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  username TEXT,
  email TEXT,
  success BOOLEAN DEFAULT true,
  ip_address TEXT,
  user_agent TEXT,
  login_time TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
-- Update existing table
ALTER TABLE login_logs ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE login_logs ADD COLUMN IF NOT EXISTS user_agent TEXT;


-- ==========================================
-- 11. Profiles
-- ==========================================
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


-- ==========================================
-- 12. Institutes Table
-- ==========================================
CREATE TABLE IF NOT EXISTS institutes (
    code TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    place TEXT,
    dist TEXT,
    region TEXT,
    type TEXT,
    minority TEXT,
    mode TEXT,
    description TEXT,
    images TEXT[] DEFAULT '{}',
    banner_image TEXT,
    logo_image TEXT,
    address TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,
    principal TEXT,
    established DATE,
    courses JSONB DEFAULT '[]',
    facilities TEXT[] DEFAULT '{}',
    departments JSONB DEFAULT '[]',
    faculty JSONB DEFAULT '[]',
    placements JSONB DEFAULT '[]',
    gallery JSONB DEFAULT '[]',
    infrastructure JSONB DEFAULT '[]',
    reviews JSONB DEFAULT '[]',
    qna JSONB DEFAULT '[]',
    status TEXT DEFAULT 'published',
    "bannerImage" TEXT,
    "logoImage" TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- Update existing table
ALTER TABLE institutes ADD COLUMN IF NOT EXISTS banner_image TEXT;
ALTER TABLE institutes ADD COLUMN IF NOT EXISTS logo_image TEXT;
ALTER TABLE institutes ADD COLUMN IF NOT EXISTS "bannerImage" TEXT;
ALTER TABLE institutes ADD COLUMN IF NOT EXISTS "logoImage" TEXT;

-- Convert established to TEXT to prevent date parsing errors
ALTER TABLE institutes ALTER COLUMN established TYPE TEXT;
ALTER TABLE institutes ADD COLUMN IF NOT EXISTS established TEXT;

ALTER TABLE institutes ADD COLUMN IF NOT EXISTS departments JSONB DEFAULT '[]';
ALTER TABLE institutes ADD COLUMN IF NOT EXISTS faculty JSONB DEFAULT '[]';
ALTER TABLE institutes ADD COLUMN IF NOT EXISTS placements JSONB DEFAULT '[]';
ALTER TABLE institutes ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]';
ALTER TABLE institutes ADD COLUMN IF NOT EXISTS infrastructure JSONB DEFAULT '[]';
ALTER TABLE institutes ADD COLUMN IF NOT EXISTS reviews JSONB DEFAULT '[]';
ALTER TABLE institutes ADD COLUMN IF NOT EXISTS qna JSONB DEFAULT '[]';


-- ==========================================
-- 13. Subscriptions
-- ==========================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);


-- ==========================================
-- 14. Contact Messages
-- ==========================================
CREATE TABLE IF NOT EXISTS contact_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);


-- ==========================================
-- 15. Storage Buckets & Policies
-- ==========================================
-- Create 'uploads' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('uploads', 'uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Create 'images' bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;


-- ==========================================
-- RLS & POLICIES (DROP & RECREATE)
-- ==========================================

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE spotlight ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE appearance ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecet_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE institutes ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

-- 1. Notifications Policies
DROP POLICY IF EXISTS "Public Read Notifications" ON notifications;
CREATE POLICY "Public Read Notifications" ON notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin All Notifications" ON notifications;
CREATE POLICY "Admin All Notifications" ON notifications FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Migration Insert Notifications" ON notifications;
CREATE POLICY "Migration Insert Notifications" ON notifications FOR INSERT WITH CHECK (true);


-- 2. Updates Policies
DROP POLICY IF EXISTS "Public Read Updates" ON updates;
CREATE POLICY "Public Read Updates" ON updates FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin All Updates" ON updates;
CREATE POLICY "Admin All Updates" ON updates FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Migration Insert Updates" ON updates;
CREATE POLICY "Migration Insert Updates" ON updates FOR INSERT WITH CHECK (true);


-- 3. Resources Policies
DROP POLICY IF EXISTS "Public Read Resources" ON resources;
CREATE POLICY "Public Read Resources" ON resources FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin All Resources" ON resources;
CREATE POLICY "Admin All Resources" ON resources FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Migration Insert Resources" ON resources;
CREATE POLICY "Migration Insert Resources" ON resources FOR INSERT WITH CHECK (true);


-- 4. Events Policies
DROP POLICY IF EXISTS "Public Read Events" ON events;
CREATE POLICY "Public Read Events" ON events FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin All Events" ON events;
CREATE POLICY "Admin All Events" ON events FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Migration Insert Events" ON events;
CREATE POLICY "Migration Insert Events" ON events FOR INSERT WITH CHECK (true);


-- 5. Spotlight Policies
DROP POLICY IF EXISTS "Public Read Spotlight" ON spotlight;
CREATE POLICY "Public Read Spotlight" ON spotlight FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin All Spotlight" ON spotlight;
CREATE POLICY "Admin All Spotlight" ON spotlight FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Migration Insert Spotlight" ON spotlight;
CREATE POLICY "Migration Insert Spotlight" ON spotlight FOR INSERT WITH CHECK (true);


-- 6. Testimonials Policies
DROP POLICY IF EXISTS "Public Read Testimonials" ON testimonials;
CREATE POLICY "Public Read Testimonials" ON testimonials FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin All Testimonials" ON testimonials;
CREATE POLICY "Admin All Testimonials" ON testimonials FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Migration Insert Testimonials" ON testimonials;
CREATE POLICY "Migration Insert Testimonials" ON testimonials FOR INSERT WITH CHECK (true);


-- 7. Gallery Policies
DROP POLICY IF EXISTS "Public Read Gallery" ON gallery;
CREATE POLICY "Public Read Gallery" ON gallery FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin All Gallery" ON gallery;
CREATE POLICY "Admin All Gallery" ON gallery FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Migration Insert Gallery" ON gallery;
CREATE POLICY "Migration Insert Gallery" ON gallery FOR INSERT WITH CHECK (true);


-- 8. Appearance Policies
DROP POLICY IF EXISTS "Public Read Appearance" ON appearance;
CREATE POLICY "Public Read Appearance" ON appearance FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin All Appearance" ON appearance;
CREATE POLICY "Admin All Appearance" ON appearance FOR ALL USING (auth.role() = 'authenticated');


-- 9. ECET Data Policies
DROP POLICY IF EXISTS "Public Read ECET Data" ON ecet_data;
CREATE POLICY "Public Read ECET Data" ON ecet_data FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin All ECET Data" ON ecet_data;
CREATE POLICY "Admin All ECET Data" ON ecet_data FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Migration Insert ECET Data" ON ecet_data;
CREATE POLICY "Migration Insert ECET Data" ON ecet_data FOR INSERT WITH CHECK (true);


-- 10. Institutes Policies
DROP POLICY IF EXISTS "Public Read Institutes" ON institutes;
CREATE POLICY "Public Read Institutes" ON institutes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin All Institutes" ON institutes;
CREATE POLICY "Admin All Institutes" ON institutes FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Migration Insert Institutes" ON institutes;
CREATE POLICY "Migration Insert Institutes" ON institutes FOR INSERT WITH CHECK (true);


-- 11. Subscriptions & Contact Policies
DROP POLICY IF EXISTS "Public Insert Subscriptions" ON subscriptions;
CREATE POLICY "Public Insert Subscriptions" ON subscriptions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin All Subscriptions" ON subscriptions;
CREATE POLICY "Admin All Subscriptions" ON subscriptions FOR ALL USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Public Insert Contact Messages" ON contact_messages;
CREATE POLICY "Public Insert Contact Messages" ON contact_messages FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Admin All Contact Messages" ON contact_messages;
CREATE POLICY "Admin All Contact Messages" ON contact_messages FOR ALL USING (auth.role() = 'authenticated');


-- 12. Login Logs Policies
DROP POLICY IF EXISTS "Migration Insert Login Logs" ON login_logs;
CREATE POLICY "Migration Insert Login Logs" ON login_logs FOR INSERT WITH CHECK (true);


-- 13. Profiles Policies
DROP POLICY IF EXISTS "Migration Insert Profiles" ON profiles;
CREATE POLICY "Migration Insert Profiles" ON profiles FOR INSERT WITH CHECK (true);


-- 14. Storage Policies
DROP POLICY IF EXISTS "Public Read Uploads" ON storage.objects;
CREATE POLICY "Public Read Uploads" ON storage.objects FOR SELECT USING (bucket_id IN ('uploads', 'images'));

DROP POLICY IF EXISTS "Public Upload Uploads" ON storage.objects;
CREATE POLICY "Public Upload Uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id IN ('uploads', 'images'));

DROP POLICY IF EXISTS "Admin Update Uploads" ON storage.objects;
CREATE POLICY "Admin Update Uploads" ON storage.objects FOR UPDATE USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin Delete Uploads" ON storage.objects;
CREATE POLICY "Admin Delete Uploads" ON storage.objects FOR DELETE USING (auth.role() = 'authenticated');
