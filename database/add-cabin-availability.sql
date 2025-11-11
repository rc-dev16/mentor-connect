-- Add cabin and availability fields to users table
-- Run this script to add the new columns

ALTER TABLE users 
ADD COLUMN IF NOT EXISTS cabin VARCHAR(50),
ADD COLUMN IF NOT EXISTS availability VARCHAR(255);

-- Update existing mentors with default values if needed
-- UPDATE users SET cabin = '', availability = '' WHERE user_type = 'mentor' AND (cabin IS NULL OR availability IS NULL);

