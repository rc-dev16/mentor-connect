require('dotenv').config({ path: './config.env' });
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'mentorflow',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
});

async function addColumns() {
  try {
    console.log('Checking for cabin and availability columns...');

    // Check if columns exist
    const checkCabin = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'cabin'
    `);

    const checkAvailability = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name = 'availability'
    `);

    // Add cabin column if it doesn't exist
    if (checkCabin.rows.length === 0) {
      console.log('Adding cabin column...');
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN cabin VARCHAR(50)
      `);
      console.log('✅ Cabin column added successfully');
    } else {
      console.log('✓ Cabin column already exists');
    }

    // Add availability column if it doesn't exist
    if (checkAvailability.rows.length === 0) {
      console.log('Adding availability column...');
      await pool.query(`
        ALTER TABLE users 
        ADD COLUMN availability VARCHAR(255)
      `);
      console.log('✅ Availability column added successfully');
    } else {
      console.log('✓ Availability column already exists');
    }

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error adding columns:', error);
    process.exit(1);
  }
}

addColumns();

