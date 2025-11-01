const { Pool } = require('pg');
require('dotenv').config({ path: '../backend/config.env' });

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'mentorflow',
  user: process.env.DB_USER || 'rohan16.',
  password: process.env.DB_PASSWORD || '',
});

// Function to generate correct mentor email
function generateMentorEmail(name) {
  const cleanName = name.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '.')
    .replace(/dr\./g, '');
  return `${cleanName}@jaipur.manipal.edu`;
}

// Function to generate correct student email
function generateStudentEmail(originalEmail) {
  // Extract the part before @ and keep the original format
  const localPart = originalEmail.split('@')[0];
  return `${localPart}@muj.manipal.edu`;
}

async function fixEmails() {
  try {
    console.log('Fixing mentor emails...');
    
    // Get all mentors
    const mentorsResult = await pool.query("SELECT id, name FROM users WHERE user_type = 'mentor'");
    
    for (const mentor of mentorsResult.rows) {
      const newEmail = generateMentorEmail(mentor.name);
      await pool.query(
        'UPDATE users SET email = $1 WHERE id = $2',
        [newEmail, mentor.id]
      );
      console.log(`Updated mentor: ${mentor.name} -> ${newEmail}`);
    }
    
    console.log('Fixing student emails...');
    
    // Get all students
    const studentsResult = await pool.query("SELECT id, email FROM users WHERE user_type = 'mentee'");
    
    for (const student of studentsResult.rows) {
      const newEmail = generateStudentEmail(student.email);
      await pool.query(
        'UPDATE users SET email = $1 WHERE id = $2',
        [newEmail, student.id]
      );
      console.log(`Updated student: ${student.email} -> ${newEmail}`);
    }
    
    console.log('Email fixes completed successfully!');
    
    // Show some examples
    console.log('\nSample mentor emails:');
    const sampleMentors = await pool.query("SELECT name, email FROM users WHERE user_type = 'mentor' LIMIT 3");
    sampleMentors.rows.forEach(mentor => {
      console.log(`  ${mentor.name}: ${mentor.email}`);
    });
    
    console.log('\nSample student emails:');
    const sampleStudents = await pool.query("SELECT name, email FROM users WHERE user_type = 'mentee' LIMIT 3");
    sampleStudents.rows.forEach(student => {
      console.log(`  ${student.name}: ${student.email}`);
    });
    
  } catch (error) {
    console.error('Error fixing emails:', error);
  } finally {
    await pool.end();
  }
}

fixEmails();

