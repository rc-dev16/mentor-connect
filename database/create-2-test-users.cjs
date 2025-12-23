const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../backend/config.env') });

// Use DATABASE_URL if available, otherwise fall back to individual config
const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'mentorflow',
      user: process.env.DB_USER || 'rohan16.',
      password: process.env.DB_PASSWORD || '',
    });

async function createTestUsers() {
  let client;
  try {
    console.log('Connecting to database...');
    client = await pool.connect();
    console.log('✓ Connected\n');

    // ============================================
    // Create Test Mentor
    // ============================================
    console.log('Creating test mentor...');
    const mentorEmail = 'test.mentor@jaipur.manipal.edu';
    const mentorName = 'Dr. Test Mentor';
    
    // Check if mentor exists
    const mentorCheck = await client.query(
      'SELECT id FROM users WHERE lower(email) = lower($1)',
      [mentorEmail]
    );

    let mentorId;
    if (mentorCheck.rows.length > 0) {
      mentorId = mentorCheck.rows[0].id;
      await client.query(
        `UPDATE users 
         SET name = $1, user_type = 'mentor', registration_number = $2, 
             department = $3, is_active = true
         WHERE id = $4`,
        [mentorName, 'FAC_TEST_001', 'Computer Science', mentorId]
      );
      console.log('✓ Test mentor updated');
    } else {
      const mentorResult = await client.query(
        `INSERT INTO users (email, password_hash, name, user_type, registration_number, department, is_active)
         VALUES ($1, '', $2, 'mentor', $3, $4, true)
         RETURNING id`,
        [mentorEmail, mentorName, 'FAC_TEST_001', 'Computer Science']
      );
      mentorId = mentorResult.rows[0].id;
      console.log('✓ Test mentor created');
    }

    // ============================================
    // Create Test Mentee
    // ============================================
    console.log('Creating test mentee...');
    const menteeEmail = 'test.mentee@muj.manipal.edu';
    const menteeName = 'Test Student';
    
    // Check if mentee exists
    const menteeCheck = await client.query(
      'SELECT id FROM users WHERE lower(email) = lower($1)',
      [menteeEmail]
    );

    let menteeId;
    if (menteeCheck.rows.length > 0) {
      menteeId = menteeCheck.rows[0].id;
      await client.query(
        `UPDATE users 
         SET name = $1, user_type = 'mentee', registration_number = $2, 
             department = $3, is_active = true
         WHERE id = $4`,
        [menteeName, '23FE10CII99999', 'Computer Science', menteeId]
      );
      console.log('✓ Test mentee updated');
    } else {
      const menteeResult = await client.query(
        `INSERT INTO users (email, password_hash, name, user_type, registration_number, department, is_active)
         VALUES ($1, '', $2, 'mentee', $3, $4, true)
         RETURNING id`,
        [menteeEmail, menteeName, '23FE10CII99999', 'Computer Science']
      );
      menteeId = menteeResult.rows[0].id;
      console.log('✓ Test mentee created');
    }

    // ============================================
    // Create Mentorship Relationship
    // ============================================
    console.log('Creating mentorship relationship...');
    const relationshipCheck = await client.query(
      'SELECT id FROM mentorship_relationships WHERE mentor_id = $1 AND mentee_id = $2',
      [mentorId, menteeId]
    );

    if (relationshipCheck.rows.length > 0) {
      await client.query(
        "UPDATE mentorship_relationships SET status = 'active', start_date = CURRENT_DATE WHERE id = $1",
        [relationshipCheck.rows[0].id]
      );
      console.log('✓ Mentorship relationship updated');
    } else {
      await client.query(
        `INSERT INTO mentorship_relationships (mentor_id, mentee_id, status, start_date, notes)
         VALUES ($1, $2, 'active', CURRENT_DATE, 'Test mentorship relationship')
         ON CONFLICT (mentor_id, mentee_id) DO UPDATE SET status = 'active', start_date = CURRENT_DATE`,
        [mentorId, menteeId]
      );
      console.log('✓ Mentorship relationship created');
    }

    // ============================================
    // Summary
    // ============================================
    console.log('\n' + '='.repeat(50));
    console.log('✅ TEST USERS CREATED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log('\nTest Credentials:');
    console.log('------------------');
    console.log('MENTOR:');
    console.log(`  Email: ${mentorEmail}`);
    console.log(`  Name: ${mentorName}`);
    console.log('\nMENTEE:');
    console.log(`  Email: ${menteeEmail}`);
    console.log(`  Name: ${menteeName}`);
    console.log('\n------------------');
    console.log('\n⚠️  IMPORTANT:');
    console.log('1. Sign up these emails in Clerk Dashboard first');
    console.log('2. Use Clerk email OTP to sign in');
    console.log('3. These users are now linked in a mentorship relationship');
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Error creating test users:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

createTestUsers();

