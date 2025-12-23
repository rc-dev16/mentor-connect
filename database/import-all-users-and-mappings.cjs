const { Pool } = require('pg');
const fs = require('fs');
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

// Simple CSV parser
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  
  return result;
}

// Read CSV file
async function readCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  const headers = parseCSVLine(lines[0]);
  
  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) continue;
    
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index];
    });
    results.push(row);
  }
  
  return results;
}

// Normalize names for matching
function normalizeName(name) {
  if (!name) return '';
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/\./g, '')
    .replace(/,/g, '')
    .replace(/kr\./g, 'kumar')
    .replace(/\bkr\b/g, 'kumar')
    .replace(/\bdr\b/g, '')
    .replace(/\bprof\b/g, 'professor')
    .trim();
}

async function importAllUsersAndMappings() {
  let client;
  try {
    console.log('Connecting to database...');
    client = await pool.connect();
    console.log('✓ Connected\n');

    // ============================================
    // STEP 1: Import Mentors from mentors.csv
    // ============================================
    console.log('='.repeat(50));
    console.log('STEP 1: Importing Mentors');
    console.log('='.repeat(50));
    
    const mentorsPath = path.join(__dirname, 'mentors.csv');
    const mentorsData = await readCSV(mentorsPath);
    console.log(`✓ Read ${mentorsData.length} mentors from CSV\n`);

    let mentorsCreated = 0;
    let mentorsUpdated = 0;
    const mentorMap = new Map(); // normalized name -> mentor db record

    for (const row of mentorsData) {
      const email = row.Email?.trim();
      const name = row.Name?.trim();
      const regNumber = row['Registration Number']?.trim();
      const department = row.Department?.trim();
      const phone = row.Phone?.trim() || null;
      const bio = row.Bio?.trim() || null;
      const isActive = row['Is Active']?.trim().toLowerCase() === 'yes';

      if (!email || !name) {
        console.warn(`⚠ Skipping mentor: missing email or name`);
        continue;
      }

      // Check if mentor exists
      const existingResult = await client.query(
        'SELECT id FROM users WHERE lower(email) = lower($1)',
        [email]
      );

      if (existingResult.rows.length > 0) {
        // Update existing mentor
        await client.query(
          `UPDATE users 
           SET name = $1, user_type = 'mentor', registration_number = $2, 
               department = $3, phone = $4, bio = $5, is_active = $6
           WHERE id = $7`,
          [name, regNumber, department, phone, bio, isActive, existingResult.rows[0].id]
        );
        mentorsUpdated++;
        mentorMap.set(normalizeName(name), { id: existingResult.rows[0].id, name, email });
      } else {
        // Create new mentor (password_hash empty since using Clerk)
        const insertResult = await client.query(
          `INSERT INTO users (email, password_hash, name, user_type, registration_number, department, phone, bio, is_active)
           VALUES ($1, '', $2, 'mentor', $3, $4, $5, $6, $7)
           RETURNING id`,
          [email, name, regNumber, department, phone, bio, isActive]
        );
        mentorsCreated++;
        mentorMap.set(normalizeName(name), { id: insertResult.rows[0].id, name, email });
      }
    }

    console.log(`✓ Created ${mentorsCreated} mentors`);
    console.log(`✓ Updated ${mentorsUpdated} mentors\n`);

    // ============================================
    // STEP 2: Import Mentees from mentor-student-assignments.csv
    // ============================================
    console.log('='.repeat(50));
    console.log('STEP 2: Importing Mentees');
    console.log('='.repeat(50));
    
    const assignmentsPath = path.join(__dirname, 'mentor-student-assignments.csv');
    const assignmentsData = await readCSV(assignmentsPath);
    console.log(`✓ Read ${assignmentsData.length} mentees from CSV\n`);

    let menteesCreated = 0;
    let menteesUpdated = 0;
    const menteeMap = new Map(); // registration number -> mentee db record
    const menteeMentorPairs = []; // { menteeReg, mentorName }

    for (const row of assignmentsData) {
      const email = row['Email Id']?.trim();
      const name = row['Student Name']?.trim();
      const regNumber = row['Registration No']?.trim()?.toUpperCase();
      const department = row.Department?.trim();
      const mentorName = row.Mentor?.trim();

      if (!email || !name || !regNumber) {
        console.warn(`⚠ Skipping mentee: missing email, name, or registration number`);
        continue;
      }

      // Check if mentee exists
      const existingResult = await client.query(
        'SELECT id FROM users WHERE lower(email) = lower($1)',
        [email]
      );

      if (existingResult.rows.length > 0) {
        // Update existing mentee
        await client.query(
          `UPDATE users 
           SET name = $1, user_type = 'mentee', registration_number = $2, 
               department = $3, is_active = true
           WHERE id = $4`,
          [name, regNumber, department, existingResult.rows[0].id]
        );
        menteesUpdated++;
        menteeMap.set(regNumber, { id: existingResult.rows[0].id, name, email, regNumber });
      } else {
        // Create new mentee (password_hash empty since using Clerk)
        const insertResult = await client.query(
          `INSERT INTO users (email, password_hash, name, user_type, registration_number, department, is_active)
           VALUES ($1, '', $2, 'mentee', $3, $4, true)
           RETURNING id`,
          [email, name, regNumber, department]
        );
        menteesCreated++;
        menteeMap.set(regNumber, { id: insertResult.rows[0].id, name, email, regNumber });
      }

      // Store mentor-mentee pair for later relationship creation
      if (mentorName) {
        menteeMentorPairs.push({ menteeReg: regNumber, mentorName: mentorName.trim() });
      }
    }

    console.log(`✓ Created ${menteesCreated} mentees`);
    console.log(`✓ Updated ${menteesUpdated} mentees\n`);

    // ============================================
    // STEP 3: Create Mentorship Relationships
    // ============================================
    console.log('='.repeat(50));
    console.log('STEP 3: Creating Mentorship Relationships');
    console.log('='.repeat(50));

    // Clear existing active relationships
    await client.query(
      "UPDATE mentorship_relationships SET status = 'inactive' WHERE status = 'active'"
    );
    console.log('✓ Cleared existing active relationships\n');

    let relationshipsCreated = 0;
    let relationshipsUpdated = 0;
    let mentorNotFound = 0;
    let menteeNotFound = 0;
    const missingMentors = new Set();
    const missingMentees = new Set();

    // Find mentor helper function
    function findMentor(mentorName) {
      const normalized = normalizeName(mentorName);
      
      // Try exact match
      if (mentorMap.has(normalized)) {
        return mentorMap.get(normalized);
      }
      
      // Try partial matches
      for (const [key, value] of mentorMap.entries()) {
        if (key.includes(normalized) || normalized.includes(key)) {
          return value;
        }
      }
      
      // Try last name matching
      const parts = normalized.split(' ');
      if (parts.length > 1) {
        const lastName = parts[parts.length - 1];
        for (const [key, value] of mentorMap.entries()) {
          if (key.includes(lastName) || lastName.length > 4 && key.includes(lastName.substring(0, 4))) {
            return value;
          }
        }
      }
      
      return null;
    }

    for (const pair of menteeMentorPairs) {
      const mentor = findMentor(pair.mentorName);
      const mentee = menteeMap.get(pair.menteeReg);

      if (!mentor) {
        missingMentors.add(pair.mentorName);
        mentorNotFound++;
        continue;
      }

      if (!mentee) {
        missingMentees.add(pair.menteeReg);
        menteeNotFound++;
        continue;
      }

      // Check if relationship already exists
      const existingResult = await client.query(
        'SELECT id FROM mentorship_relationships WHERE mentor_id = $1 AND mentee_id = $2',
        [mentor.id, mentee.id]
      );

      if (existingResult.rows.length > 0) {
        // Update to active
        await client.query(
          "UPDATE mentorship_relationships SET status = 'active', start_date = CURRENT_DATE WHERE id = $1",
          [existingResult.rows[0].id]
        );
        relationshipsUpdated++;
      } else {
        // Create new relationship
        await client.query(
          `INSERT INTO mentorship_relationships (mentor_id, mentee_id, status, start_date)
           VALUES ($1, $2, 'active', CURRENT_DATE)
           ON CONFLICT (mentor_id, mentee_id) DO UPDATE SET status = 'active', start_date = CURRENT_DATE`,
          [mentor.id, mentee.id]
        );
        relationshipsCreated++;
      }
    }

    console.log(`✓ Created ${relationshipsCreated} relationships`);
    console.log(`✓ Updated ${relationshipsUpdated} relationships`);
    console.log(`✗ Mentor not found: ${mentorNotFound}`);
    console.log(`✗ Mentee not found: ${menteeNotFound}\n`);

    if (missingMentors.size > 0) {
      console.log('Mentors not found in database:');
      Array.from(missingMentors).slice(0, 10).forEach(name => {
        console.log(`  - ${name}`);
      });
      if (missingMentors.size > 10) {
        console.log(`  ... and ${missingMentors.size - 10} more`);
      }
      console.log();
    }

    if (missingMentees.size > 0) {
      console.log('Mentees not found (registration numbers):');
      Array.from(missingMentees).slice(0, 10).forEach(reg => {
        console.log(`  - ${reg}`);
      });
      if (missingMentees.size > 10) {
        console.log(`  ... and ${missingMentees.size - 10} more`);
      }
      console.log();
    }

    // ============================================
    // STEP 4: Summary
    // ============================================
    console.log('='.repeat(50));
    console.log('✅ IMPORT COMPLETE!');
    console.log('='.repeat(50));

    // Show final assignment counts per mentor
    const assignmentCounts = await client.query(`
      SELECT m.name as mentor_name, COUNT(mr.id) as mentee_count
      FROM users m
      LEFT JOIN mentorship_relationships mr ON m.id = mr.mentor_id AND mr.status = 'active'
      WHERE m.user_type = 'mentor' AND m.is_active = true
      GROUP BY m.id, m.name
      ORDER BY mentee_count DESC, m.name
    `);

    console.log('\nFinal assignment counts:');
    console.log('-'.repeat(50));
    assignmentCounts.rows.forEach(row => {
      console.log(`  ${row.mentor_name}: ${row.mentee_count} mentees`);
    });

    console.log('\n' + '='.repeat(50) + '\n');

  } catch (error) {
    console.error('❌ Error importing users and mappings:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

importAllUsersAndMappings();

