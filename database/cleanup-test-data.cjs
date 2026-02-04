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

async function cleanupTestData() {
  let client;
  try {
    console.log('Connecting to database...');
    client = await pool.connect();
    console.log('✓ Connected\n');

    console.log('='.repeat(50));
    console.log('CLEANING UP TEST DATA');
    console.log('='.repeat(50) + '\n');

    // List of test user emails to remove
    const testEmails = [
      'test.mentor@jaipur.manipal.edu',
      'test.mentee@muj.manipal.edu',
      'praveen.kr.shukla@jaipur.manipal.edu', // Old test user
      'nishant.23fe10cii00012@muj.manipal.edu', // Old test user
    ];

    let deletedCount = 0;

    for (const email of testEmails) {
      console.log(`Checking user: ${email}...`);
      
      // Get user ID
      const userResult = await client.query(
        'SELECT id FROM users WHERE lower(email) = lower($1)',
        [email]
      );

      if (userResult.rows.length > 0) {
        const userId = userResult.rows[0].id;
        
        // Delete mentorship relationships
        await client.query(
          'DELETE FROM mentorship_relationships WHERE mentor_id = $1 OR mentee_id = $1',
          [userId]
        );
        
        // Delete personal information
        await client.query(
          'DELETE FROM personal_information WHERE user_id = $1',
          [userId]
        );
        
        // Delete user
        await client.query(
          'DELETE FROM users WHERE id = $1',
          [userId]
        );
        
        deletedCount++;
        console.log(`  ✓ Deleted user and related data`);
      } else {
        console.log(`  - User not found`);
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ CLEANUP COMPLETE!');
    console.log('='.repeat(50));
    console.log(`Deleted ${deletedCount} test user(s) and their related data`);
    console.log('='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Error cleaning up test data:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

cleanupTestData();








