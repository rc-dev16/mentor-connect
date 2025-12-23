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

async function addClerkUsersToDb() {
  let client;
  try {
    console.log('Connecting to database...');
    client = await pool.connect();
    console.log('✓ Connected\n');

    // ============================================
    // CONFIGURE YOUR TEST USERS HERE
    // ============================================
    const users = [
      {
        email: process.argv[2] || 'MENTOR_EMAIL@jaipur.manipal.edu', // Replace with your mentor email
        name: process.argv[3] || 'Test Mentor',
        userType: 'mentor',
        registrationNumber: 'FAC_TEST_001',
        department: 'Computer Science',
      },
      {
        email: process.argv[4] || 'MENTEE_EMAIL@muj.manipal.edu', // Replace with your mentee email
        name: process.argv[5] || 'Test Mentee',
        userType: 'mentee',
        registrationNumber: '23FE10CII99999',
        department: 'Computer Science',
      },
    ];

    console.log('='.repeat(50));
    console.log('ADDING CLERK USERS TO DATABASE');
    console.log('='.repeat(50) + '\n');

    const userIds = {};

    // Add each user to database
    for (const user of users) {
      console.log(`Processing ${user.userType}: ${user.email}...`);
      
      // Check if user exists
      const checkResult = await client.query(
        'SELECT id FROM users WHERE lower(email) = lower($1)',
        [user.email]
      );

      let userId;
      if (checkResult.rows.length > 0) {
        // Update existing user
        userId = checkResult.rows[0].id;
        await client.query(
          `UPDATE users 
           SET name = $1, user_type = $2, registration_number = $3, 
               department = $4, is_active = true
           WHERE id = $5`,
          [user.name, user.userType, user.registrationNumber, user.department, userId]
        );
        console.log(`  ✓ Updated existing ${user.userType}`);
      } else {
        // Create new user
        const insertResult = await client.query(
          `INSERT INTO users (email, password_hash, name, user_type, registration_number, department, is_active)
           VALUES ($1, '', $2, $3, $4, $5, true)
           RETURNING id`,
          [user.email, user.name, user.userType, user.registrationNumber, user.department]
        );
        userId = insertResult.rows[0].id;
        console.log(`  ✓ Created new ${user.userType}`);
      }

      userIds[user.userType] = userId;
    }

    // ============================================
    // Create Mentorship Relationship
    // ============================================
    if (userIds.mentor && userIds.mentee) {
      console.log('\nCreating mentorship relationship...');
      const relationshipCheck = await client.query(
        'SELECT id FROM mentorship_relationships WHERE mentor_id = $1 AND mentee_id = $2',
        [userIds.mentor, userIds.mentee]
      );

      if (relationshipCheck.rows.length > 0) {
        await client.query(
          "UPDATE mentorship_relationships SET status = 'active', start_date = CURRENT_DATE WHERE id = $1",
          [relationshipCheck.rows[0].id]
        );
        console.log('  ✓ Mentorship relationship updated');
      } else {
        await client.query(
          `INSERT INTO mentorship_relationships (mentor_id, mentee_id, status, start_date, notes)
           VALUES ($1, $2, 'active', CURRENT_DATE, 'Test mentorship relationship')
           ON CONFLICT (mentor_id, mentee_id) DO UPDATE SET status = 'active', start_date = CURRENT_DATE`,
          [userIds.mentor, userIds.mentee]
        );
        console.log('  ✓ Mentorship relationship created');
      }
    }

    // ============================================
    // Summary
    // ============================================
    console.log('\n' + '='.repeat(50));
    console.log('✅ USERS ADDED TO DATABASE SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log('\nUsers in database:');
    console.log('------------------');
    users.forEach(user => {
      console.log(`${user.userType.toUpperCase()}:`);
      console.log(`  Email: ${user.email}`);
      console.log(`  Name: ${user.name}`);
      console.log('');
    });
    console.log('------------------');
    console.log('\n✅ These users can now sign in via Clerk!');
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Error adding users to database:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

addClerkUsersToDb();

