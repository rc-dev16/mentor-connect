const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'config.env') });

const pool = new Pool({
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

// Find best matching mentor
function findMentor(mentorName, mentorMap) {
  const normalized = normalizeName(mentorName);
  
  // Try exact match
  if (mentorMap.has(normalized)) {
    return mentorMap.get(normalized);
  }
  
  // Try partial matches
  for (const [key, value] of mentorMap.entries()) {
    // Check if normalized names are similar (at least 60% match)
    const similarity = calculateSimilarity(normalized, key);
    if (similarity > 0.6) {
      return value;
    }
  }
  
  // Try extracting last name and matching
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

// Simple similarity calculation
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

// Levenshtein distance
function levenshteinDistance(str1, str2) {
  const matrix = [];
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  return matrix[str2.length][str1.length];
}

async function fixMentorMenteeMapping() {
  let client;
  try {
    console.log('Connecting to database...');
    client = await pool.connect();
    console.log('✓ Connected\n');

    // Read CSV file
    const csvPath = path.join(__dirname, '..', 'database', 'mentor-student-assignments.csv');
    console.log('Reading CSV file...');
    const csvData = await readCSV(csvPath);
    console.log(`✓ Read ${csvData.length} records from CSV\n`);

    // Get all mentors from database
    const mentorsResult = await client.query(
      'SELECT id, name, email FROM users WHERE user_type = $1 AND is_active = true',
      ['mentor']
    );
    const mentors = mentorsResult.rows;
    console.log(`Found ${mentors.length} mentors in database\n`);

    // Create mentor lookup map (normalized name -> mentor)
    const mentorMap = new Map();
    mentors.forEach(mentor => {
      const normalized = normalizeName(mentor.name);
      if (!mentorMap.has(normalized)) {
        mentorMap.set(normalized, mentor);
      }
    });

    // Get all mentees from database
    const menteesResult = await client.query(
      'SELECT id, name, email, registration_number FROM users WHERE user_type = $1 AND is_active = true',
      ['mentee']
    );
    const mentees = menteesResult.rows;
    console.log(`Found ${mentees.length} mentees in database\n`);

    // Create mentee lookup map (registration number -> mentee)
    const menteeMap = new Map();
    mentees.forEach(mentee => {
      const regNum = mentee.registration_number?.toUpperCase().trim();
      if (regNum) {
        menteeMap.set(regNum, mentee);
      }
    });

    // Clear existing active mentorship relationships
    console.log('Clearing existing active mentorship relationships...');
    await client.query(
      "UPDATE mentorship_relationships SET status = 'inactive' WHERE status = 'active'"
    );
    console.log('✓ Cleared existing relationships\n');

    // Track statistics
    let assigned = 0;
    let mentorNotFound = 0;
    let menteeNotFound = 0;
    const missingMentors = new Set();
    const missingMentees = new Set();

    // Process CSV and create new relationships
    console.log('Processing CSV assignments...');
    for (const row of csvData) {
      const mentorName = row.Mentor?.trim() || row['Mentor']?.trim() || '';
      const registrationNumber = row['Registration No']?.trim()?.toUpperCase() || 
                                  row['Registration No']?.trim()?.toUpperCase() ||
                                  row.registration_number?.trim()?.toUpperCase();

      if (!mentorName || !registrationNumber) continue;

      // Find mentor using improved matching
      const mentor = findMentor(mentorName, mentorMap);

      if (!mentor) {
        missingMentors.add(mentorName);
        mentorNotFound++;
        continue;
      }

      // Find mentee
      const mentee = menteeMap.get(registrationNumber);
      if (!mentee) {
        missingMentees.add(registrationNumber);
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
      } else {
        // Create new relationship
        await client.query(
          `INSERT INTO mentorship_relationships (mentor_id, mentee_id, status, start_date)
           VALUES ($1, $2, 'active', CURRENT_DATE)
           ON CONFLICT (mentor_id, mentee_id) DO UPDATE SET status = 'active', start_date = CURRENT_DATE`,
          [mentor.id, mentee.id]
        );
      }

      assigned++;
    }

    console.log('\n========================================');
    console.log('✅ MENTOR-MENTEE MAPPING CORRECTED!');
    console.log('========================================\n');
    console.log('Summary:');
    console.log('--------');
    console.log(`✓ Successfully assigned: ${assigned}`);
    console.log(`✗ Mentor not found: ${mentorNotFound}`);
    console.log(`✗ Mentee not found: ${menteeNotFound}`);
    console.log(`\nTotal records processed: ${csvData.length}\n`);

    if (missingMentors.size > 0) {
      console.log('Mentors not found in database:');
      Array.from(missingMentors).forEach(name => {
        console.log(`  - ${name}`);
      });
      console.log();
    }

    if (missingMentees.size > 0) {
      console.log('Mentees not found in database (registration numbers):');
      Array.from(missingMentees).slice(0, 10).forEach(reg => {
        console.log(`  - ${reg}`);
      });
      if (missingMentees.size > 10) {
        console.log(`  ... and ${missingMentees.size - 10} more`);
      }
      console.log();
    }

    // Show final assignment counts per mentor
    const assignmentCounts = await client.query(`
      SELECT m.name as mentor_name, COUNT(mr.id) as mentee_count
      FROM users m
      LEFT JOIN mentorship_relationships mr ON m.id = mr.mentor_id AND mr.status = 'active'
      WHERE m.user_type = 'mentor' AND m.is_active = true
      GROUP BY m.id, m.name
      ORDER BY mentee_count DESC, m.name
    `);

    console.log('Final assignment counts:');
    console.log('------------------------');
    assignmentCounts.rows.forEach(row => {
      console.log(`  ${row.mentor_name}: ${row.mentee_count} mentees`);
    });

    console.log('\n========================================\n');

  } catch (error) {
    console.error('❌ Error fixing mentor-mentee mapping:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

fixMentorMenteeMapping();

