-- Clean up any existing table from previous failed attempts to ensure correct types
DROP TABLE IF EXISTS platform_settings;

-- Create platform_settings table with explicit types
CREATE TABLE platform_settings (
    id BIGINT PRIMARY KEY,
    community_members INTEGER DEFAULT 6554,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Ensure there is only one row for settings
ALTER TABLE platform_settings ADD CONSTRAINT singleton_row CHECK (id = 1);

-- Insert initial data
INSERT INTO platform_settings (id, community_members)
VALUES (1, 6554);

-- Enable Row Level Security (RLS)
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public to read settings" 
ON platform_settings 
FOR SELECT 
TO public 
USING (true);

-- Allow authenticated users (admins) to update the settings
CREATE POLICY "Allow authenticated users to update settings" 
ON platform_settings 
FOR UPDATE 
TO authenticated 
USING (true)
WITH CHECK (true);
