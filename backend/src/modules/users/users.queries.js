const pool = require('../../config/database');

async function checkColumnExists(tableName, columnName) {
  try {
    const query = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = $1 AND column_name = $2
    `;
    const result = await pool.query(query, [tableName, columnName]);
    return result.rows.length > 0;
  } catch (error) {
    console.error(`Error checking column ${columnName}:`, error);
    return false;
  }
}

async function selectUserProfile(userId, { hasCabin, hasAvailability }) {
  let columns = 'id, email, name, user_type, registration_number, department, phone, bio, created_at';
  if (hasCabin) columns += ', cabin';
  if (hasAvailability) columns += ', availability';

  const query = `SELECT ${columns} FROM users WHERE id = $1`;
  const result = await pool.query(query, [userId]);
  return result.rows[0] || null;
}

async function updateUserProfile(userId, updates, values, paramCount, { hasCabin, hasAvailability }) {
  let returningColumns = 'id, email, name, user_type, registration_number, department, phone, bio, created_at, updated_at';
  if (hasCabin) returningColumns += ', cabin';
  if (hasAvailability) returningColumns += ', availability';

  const query = `
    UPDATE users 
    SET ${updates.join(', ')}
    WHERE id = $${paramCount}
    RETURNING ${returningColumns}
  `;

  const result = await pool.query(query, values);
  return result.rows[0] || null;
}

async function selectActiveMentor(menteeId, { hasCabin, hasAvailability }) {
  let columns = 'u.id, u.name, u.email, u.phone';
  if (hasCabin) columns += ', u.cabin';
  if (hasAvailability) columns += ', u.availability';

  const query = `
    SELECT ${columns}
    FROM mentorship_relationships mr
    JOIN users u ON u.id = mr.mentor_id
    WHERE mr.mentee_id = $1 AND mr.status = 'active'
    ORDER BY mr.start_date DESC
    LIMIT 1
  `;
  const result = await pool.query(query, [menteeId]);
  return result.rows[0] || null;
}

async function selectMenteesByMentor(mentorId) {
  const query = `
    SELECT 
      u.id, 
      u.name, 
      u.email, 
      u.registration_number, 
      u.department, 
      u.phone, 
      u.bio,
      mr.status as mentorship_status,
      EXISTS (
        SELECT 1 FROM personal_information pi WHERE pi.user_id = u.id
      ) AS has_personal_info
    FROM users u
    JOIN mentorship_relationships mr ON u.id = mr.mentee_id
    WHERE mr.mentor_id = $1 AND u.is_active = true
    ORDER BY u.name
  `;

  const result = await pool.query(query, [mentorId]);
  return result.rows;
}

async function selectTotalMenteesCount(mentorId) {
  const query = `
    SELECT COUNT(*) AS count
    FROM mentorship_relationships mr
    JOIN users u ON u.id = mr.mentee_id
    WHERE mr.mentor_id = $1 AND mr.status = 'active' AND u.is_active = true
  `;
  const result = await pool.query(query, [mentorId]);
  return result;
}

async function selectUpcomingMeetingsCount(mentorId) {
  const query = `
    SELECT COUNT(*) AS count
    FROM meetings m
    WHERE m.mentor_id = $1 
      AND m.status = 'scheduled'
      AND m.meeting_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
  `;
  const result = await pool.query(query, [mentorId]);
  return result;
}

async function selectCompletedSessionsCount(mentorId) {
  const query = `
    SELECT COUNT(*) AS count
    FROM meetings m
    WHERE m.mentor_id = $1 AND m.status = 'completed'
  `;
  const result = await pool.query(query, [mentorId]);
  return result;
}

module.exports = {
  checkColumnExists,
  selectUserProfile,
  updateUserProfile,
  selectActiveMentor,
  selectMenteesByMentor,
  selectTotalMenteesCount,
  selectUpcomingMeetingsCount,
  selectCompletedSessionsCount,
};
