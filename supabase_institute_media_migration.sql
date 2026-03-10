-- Add logo_image and banner_image columns to institutes table if they don't exist
ALTER TABLE institutes ADD COLUMN IF NOT EXISTS logo_image TEXT;
ALTER TABLE institutes ADD COLUMN IF NOT EXISTS banner_image TEXT;

-- Verify columns exist (optional, for safety)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='institutes' AND column_name='logo_image') THEN
        ALTER TABLE institutes ADD COLUMN logo_image TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='institutes' AND column_name='banner_image') THEN
        ALTER TABLE institutes ADD COLUMN banner_image TEXT;
    END IF;
END $$;
