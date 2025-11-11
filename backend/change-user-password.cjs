const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');
const readline = require('readline');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'mentorflow',
  user: process.env.DB_USER || 'rohan16.',
  password: process.env.DB_PASSWORD || '',
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function changePassword() {
  let client;
  try {
    console.log('\n========================================');
    console.log('MentorFlow - Change User Password');
    console.log('========================================\n');

    // Get user email
    const email = await question('Enter user email: ');
    if (!email) {
      console.log('❌ Email is required');
      process.exit(1);
    }

    // Connect to database
    console.log('\nConnecting to database...');
    client = await pool.connect();
    console.log('✓ Connected\n');

    // Find user
    const userResult = await client.query(
      'SELECT id, email, name, user_type FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );

    if (userResult.rows.length === 0) {
      console.log(`❌ User not found: ${email}`);
      process.exit(1);
    }

    const user = userResult.rows[0];
    console.log('User found:');
    console.log(`  Name: ${user.name}`);
    console.log(`  Email: ${user.email}`);
    console.log(`  Type: ${user.user_type}\n`);

    // Get new password
    const newPassword = await question('Enter new password (min 6 characters): ');
    if (!newPassword || newPassword.length < 6) {
      console.log('❌ Password must be at least 6 characters');
      process.exit(1);
    }

    // Confirm password
    const confirmPassword = await question('Confirm new password: ');
    if (newPassword !== confirmPassword) {
      console.log('❌ Passwords do not match');
      process.exit(1);
    }

    // Generate hash and update
    console.log('\nGenerating password hash...');
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    await client.query(
      'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [passwordHash, user.id]
    );

    console.log('\n========================================');
    console.log('✅ PASSWORD UPDATED SUCCESSFULLY!');
    console.log('========================================\n');
    console.log(`User: ${user.name}`);
    console.log(`Email: ${user.email}`);
    console.log(`New Password: ${newPassword}\n`);
    console.log('User can now login with the new password.');
    console.log('========================================\n');

  } catch (error) {
    console.error('❌ Error changing password:', error.message);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
    rl.close();
  }
}

changePassword();

