require('dotenv').config({ path: './config.env' });
const { Pool } = require('pg');

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS || 10000),
    })
  : new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'mentorflow',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS || 10000),
    });

async function migrate() {
  try {
    console.log('Adding Clerk auth columns if needed...');
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS clerk_user_id VARCHAR(255),
      ADD COLUMN IF NOT EXISTS password_setup_completed BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE
    `);

    await pool.query(`
      UPDATE users
      SET password_setup_completed = false
      WHERE password_setup_completed IS NULL
    `);

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_clerk_user_id
      ON users(clerk_user_id)
      WHERE clerk_user_id IS NOT NULL
    `);

    await pool.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower
      ON users(LOWER(email))
    `);

    console.log('Clerk auth migration completed successfully.');
  } catch (error) {
    console.error('Clerk auth migration failed:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

migrate();
