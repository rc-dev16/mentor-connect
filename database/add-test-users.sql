-- Add Test Users for MentorFlow
-- Password for both users: password123
-- Hashed using bcrypt with 10 salt rounds

-- The password hash for 'password123' using bcrypt
-- You need to generate this hash properly using bcrypt

-- Delete existing test users if they exist
DELETE FROM users WHERE email IN ('praveen.kr.shukla@jaipur.manipal.edu', 'nishant.23fe10cii00012@muj.manipal.edu');

-- Insert test mentor
INSERT INTO users (
    email, 
    password_hash, 
    name, 
    user_type, 
    registration_number, 
    department, 
    phone, 
    bio,
    is_active
) VALUES (
    'praveen.kr.shukla@jaipur.manipal.edu',
    '$2a$10$YourHashedPasswordHere', -- This will be replaced by script
    'Dr. Praveen Kumar Shukla',
    'mentor',
    'FAC001',
    'Computer Science',
    '+91-9876543210',
    'Assistant Professor with 10 years of experience in Computer Science and Engineering.',
    true
);

-- Insert test student
INSERT INTO users (
    email, 
    password_hash, 
    name, 
    user_type, 
    registration_number, 
    department, 
    phone, 
    bio,
    is_active
) VALUES (
    'nishant.23fe10cii00012@muj.manipal.edu',
    '$2a$10$YourHashedPasswordHere', -- This will be replaced by script
    'Nishant Kumar',
    'mentee',
    '23FE10CII00012',
    'Computer Science',
    '+91-9876543211',
    'Second year Computer Science student interested in AI and Machine Learning.',
    true
);

-- Create a mentorship relationship between them
INSERT INTO mentorship_relationships (
    mentor_id, 
    mentee_id, 
    status, 
    start_date, 
    notes
) 
SELECT 
    m.id as mentor_id,
    s.id as mentee_id,
    'active' as status,
    CURRENT_DATE as start_date,
    'Test mentorship relationship' as notes
FROM 
    users m,
    users s
WHERE 
    m.email = 'praveen.kr.shukla@jaipur.manipal.edu'
    AND s.email = 'nishant.23fe10cii00012@muj.manipal.edu'
ON CONFLICT DO NOTHING;

