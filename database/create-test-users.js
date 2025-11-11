const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../backend/config.env' });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'mentorflow',
  user: process.env.DB_USER || 'rohan16.',
  password: process.env.DB_PASSWORD || '',
});

async function createTestUsers() {
  try {
    console.log('Connecting to database...');
    await pool.connect();
    console.log('Connected successfully!');

    // The password we want to use
    const password = 'password123';
    
    // Generate bcrypt hash
    console.log('Generating password hash...');
    const passwordHash = await bcrypt.hash(password, 10);
    console.log('Password hash generated successfully');

    // Delete existing test users if they exist
    console.log('Cleaning up existing test users...');
    await pool.query(`
      DELETE FROM users 
      WHERE email IN ('praveen.kr.shukla@jaipur.manipal.edu', 'nishant.23fe10cii00012@muj.manipal.edu')
    `);

    // Insert test mentor
    console.log('Creating test mentor...');
    const mentorResult = await pool.query(`
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
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, email, name, user_type
    `, [
      'praveen.kr.shukla@jaipur.manipal.edu',
      passwordHash,
      'Dr. Praveen Kumar Shukla',
      'mentor',
      'FAC001',
      'Computer Science',
      '+91-9876543210',
      'Assistant Professor with 10 years of experience in Computer Science and Engineering.',
      true
    ]);
    console.log('✓ Test mentor created:', mentorResult.rows[0]);

    // Insert test student
    console.log('Creating test student...');
    const studentResult = await pool.query(`
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
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, email, name, user_type
    `, [
      'nishant.23fe10cii00012@muj.manipal.edu',
      passwordHash,
      'Nishant Kumar',
      'mentee',
      '23FE10CII00012',
      'Computer Science',
      '+91-9876543211',
      'Second year Computer Science student interested in AI and Machine Learning.',
      true
    ]);
    console.log('✓ Test student created:', studentResult.rows[0]);

    // Create mentorship relationship
    console.log('Creating mentorship relationship...');
    await pool.query(`
      INSERT INTO mentorship_relationships (
        mentor_id, 
        mentee_id, 
        status, 
        start_date, 
        notes
      ) VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT DO NOTHING
    `, [
      mentorResult.rows[0].id,
      studentResult.rows[0].id,
      'active',
      new Date(),
      'Test mentorship relationship'
    ]);
    console.log('✓ Mentorship relationship created');

    console.log('\n========================================');
    console.log('✓ Test users created successfully!');
    console.log('========================================');
    console.log('\nTest Credentials:');
    console.log('------------------');
    console.log('Mentor Email: praveen.kr.shukla@jaipur.manipal.edu');
    console.log('Student Email: nishant.23fe10cii00012@muj.manipal.edu');
    console.log('Password (both): password123');
    console.log('------------------\n');

  } catch (error) {
    console.error('Error creating test users:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createTestUsers();

