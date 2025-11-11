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

async function exportMentorsToCSV() {
  let client;
  try {
    console.log('Connecting to database...');
    client = await pool.connect();
    console.log('✓ Connected\n');

    // Get all mentors with mentee counts
    const result = await client.query(`
      SELECT 
        u.id,
        u.name,
        u.email,
        u.registration_number,
        COALESCE(u.department, '') as department,
        COALESCE(u.phone, '') as phone,
        COALESCE(u.bio, '') as bio,
        u.is_active,
        u.created_at,
        u.updated_at,
        COUNT(DISTINCT mr.mentee_id) as mentee_count
      FROM users u
      LEFT JOIN mentorship_relationships mr ON u.id = mr.mentor_id AND mr.status = 'active'
      WHERE u.user_type = 'mentor'
      GROUP BY u.id, u.name, u.email, u.registration_number, u.department, u.phone, u.bio, u.is_active, u.created_at, u.updated_at
      ORDER BY u.name
    `);

    const mentors = result.rows;
    console.log(`Found ${mentors.length} mentors in the database\n`);

    // CSV Header
    const headers = [
      'ID',
      'Name',
      'Email',
      'Registration Number',
      'Department',
      'Phone',
      'Bio',
      'Is Active',
      'Mentee Count',
      'Created At',
      'Updated At'
    ];

    // Escape CSV values (handle commas and quotes)
    function escapeCSV(value) {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      // If contains comma, quote, or newline, wrap in quotes and escape quotes
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }

    // Build CSV content
    let csvContent = headers.join(',') + '\n';

    mentors.forEach(mentor => {
      const row = [
        escapeCSV(mentor.id),
        escapeCSV(mentor.name),
        escapeCSV(mentor.email),
        escapeCSV(mentor.registration_number),
        escapeCSV(mentor.department),
        escapeCSV(mentor.phone),
        escapeCSV(mentor.bio),
        escapeCSV(mentor.is_active ? 'Yes' : 'No'),
        escapeCSV(mentor.mentee_count),
        escapeCSV(mentor.created_at),
        escapeCSV(mentor.updated_at)
      ];
      csvContent += row.join(',') + '\n';
    });

    // Write to file
    const outputPath = path.join(__dirname, '..', 'database', 'mentors.csv');
    fs.writeFileSync(outputPath, csvContent, 'utf8');

    console.log('========================================');
    console.log('✅ MENTORS CSV EXPORT COMPLETE!');
    console.log('========================================\n');
    console.log(`File saved to: ${outputPath}`);
    console.log(`Total mentors exported: ${mentors.length}\n`);
    
    // Show summary
    const activeCount = mentors.filter(m => m.is_active).length;
    const totalMentees = mentors.reduce((sum, m) => sum + parseInt(m.mentee_count), 0);
    
    console.log('Summary:');
    console.log('--------');
    console.log(`Active mentors: ${activeCount}`);
    console.log(`Total mentees assigned: ${totalMentees}`);
    console.log(`Average mentees per mentor: ${(totalMentees / mentors.length).toFixed(1)}`);
    console.log('\n========================================\n');

    // Show sample data
    console.log('Sample mentor data:');
    console.log('-------------------');
    mentors.slice(0, 3).forEach(mentor => {
      console.log(`\n${mentor.name}`);
      console.log(`  Email: ${mentor.email}`);
      console.log(`  Department: ${mentor.department || 'N/A'}`);
      console.log(`  Mentees: ${mentor.mentee_count}`);
      console.log(`  Active: ${mentor.is_active ? 'Yes' : 'No'}`);
    });
    console.log('\n========================================\n');

  } catch (error) {
    console.error('❌ Error exporting mentors:', error);
    console.error('Error details:', error.message);
    process.exit(1);
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

exportMentorsToCSV();




