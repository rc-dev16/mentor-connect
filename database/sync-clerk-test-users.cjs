const path = require('path');
require('../backend/node_modules/dotenv').config({ path: path.join(__dirname, '../backend/config.env') });

const { Pool } = require('../backend/node_modules/pg');
const { clerkClient } = require('../backend/node_modules/@clerk/express');

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
      user: process.env.DB_USER || 'rohan16.',
      password: process.env.DB_PASSWORD || '',
      connectionTimeoutMillis: Number(process.env.DB_CONNECTION_TIMEOUT_MS || 10000),
    });

const testUsers = [
  {
    email: 'chawdarohan16@gmail.com',
    firstName: 'Rohan',
    lastName: 'Chawda',
    role: 'mentor',
  },
  {
    email: 'rohanc1604@gmail.com',
    firstName: 'Rohan',
    lastName: 'C',
    role: 'mentee',
  },
];

async function findClerkUserByEmail(email) {
  const response = await clerkClient.users.getUserList({ emailAddress: [email] });
  return response.data?.[0] || null;
}

async function ensureClerkUser(user) {
  const existing = await findClerkUserByEmail(user.email);
  if (existing) {
    await clerkClient.users.updateUser(existing.id, {
      firstName: user.firstName,
      lastName: user.lastName,
      publicMetadata: { userType: user.role },
    });
    return { clerkUser: existing, created: false };
  }

  const clerkUser = await clerkClient.users.createUser({
    emailAddress: [user.email],
    firstName: user.firstName,
    lastName: user.lastName,
    skipPasswordRequirement: true,
    publicMetadata: { userType: user.role },
  });

  return { clerkUser, created: true };
}

async function sync() {
  let client;
  try {
    client = await pool.connect();
    console.log('Connected to database');

    for (const user of testUsers) {
      const { clerkUser, created } = await ensureClerkUser(user);
      await client.query(
        `UPDATE users
         SET clerk_user_id = $1,
             password_setup_completed = false,
             updated_at = CURRENT_TIMESTAMP
         WHERE LOWER(email) = LOWER($2)`,
        [clerkUser.id, user.email]
      );

      console.log(`${created ? 'Created' : 'Updated'} Clerk user ${user.email} -> ${clerkUser.id}`);
    }

    console.log('Clerk test user sync complete');
  } catch (error) {
    console.error('Failed to sync Clerk test users:', error);
    process.exitCode = 1;
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

sync();
