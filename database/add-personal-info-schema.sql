-- Add personal information table for mentees
-- This table stores detailed personal information that mentees fill out

CREATE TABLE IF NOT EXISTS personal_information (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Basic Information
    section VARCHAR(10),
    roll_no VARCHAR(20),
    branch VARCHAR(100),
    blood_group VARCHAR(10),
    hostel_block VARCHAR(20),
    room_no VARCHAR(20),
    date_of_birth DATE,
    
    -- MUJ Alumni Information
    has_muj_alumni BOOLEAN DEFAULT false,
    alumni_details TEXT,
    
    -- Father's Information
    father_name VARCHAR(255),
    father_mobile VARCHAR(20),
    father_email VARCHAR(255),
    father_occupation VARCHAR(100),
    father_organization VARCHAR(255),
    father_designation VARCHAR(255),
    
    -- Mother's Information
    mother_name VARCHAR(255),
    mother_mobile VARCHAR(20),
    mother_email VARCHAR(255),
    mother_occupation VARCHAR(100),
    mother_organization VARCHAR(255),
    mother_designation VARCHAR(255),
    
    -- Address Information
    communication_address TEXT,
    communication_pincode VARCHAR(10),
    permanent_address TEXT,
    permanent_pincode VARCHAR(10),
    
    -- Business Card
    business_card_url VARCHAR(500),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure one record per user
    UNIQUE(user_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_personal_info_user_id ON personal_information(user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_personal_info_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_personal_info_updated_at
    BEFORE UPDATE ON personal_information
    FOR EACH ROW
    EXECUTE FUNCTION update_personal_info_updated_at();

