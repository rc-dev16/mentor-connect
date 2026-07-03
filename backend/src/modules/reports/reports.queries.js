const pool = require('../../config/database');

async function getReportsByMentorId(mentorId) {
  const query = `
      SELECT * FROM reports 
      WHERE mentor_id = $1 
      ORDER BY created_at DESC
    `;

  const result = await pool.query(query, [mentorId]);
  return result.rows;
}

module.exports = {
  getReportsByMentorId,
};
