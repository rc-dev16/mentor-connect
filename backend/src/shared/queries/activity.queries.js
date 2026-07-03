const pool = require('../../config/database');

async function selectRecentNotifications(userId, limit = 10) {
  const query = `
    SELECT id, title, message, type, is_read, related_entity_type, related_entity_id, created_at
    FROM notifications
    WHERE user_id = $1
    ORDER BY created_at DESC
    LIMIT $2
  `;
  const result = await pool.query(query, [userId, limit]);
  return result.rows;
}

async function selectRecentSessionRequestsForMentor(mentorId, limit = 10) {
  const query = `
    SELECT id, title, status, preferred_date, preferred_time, created_at, updated_at
    FROM session_requests
    WHERE mentor_id = $1
    ORDER BY COALESCE(updated_at, created_at) DESC
    LIMIT $2
  `;
  const result = await pool.query(query, [mentorId, limit]);
  return result.rows;
}

async function selectRecentSessionRequestsForMentee(menteeId, limit = 10) {
  const query = `
    SELECT id, title, status, preferred_date, preferred_time, created_at, updated_at
    FROM session_requests
    WHERE mentee_id = $1
    ORDER BY COALESCE(updated_at, created_at) DESC
    LIMIT $2
  `;
  const result = await pool.query(query, [menteeId, limit]);
  return result.rows;
}

async function selectPendingRequestsCount(mentorId) {
  const query = `
    SELECT COUNT(*) AS count
    FROM session_requests
    WHERE mentor_id = $1 AND status = 'pending'
  `;
  const result = await pool.query(query, [mentorId]);
  return Number(result.rows[0]?.count || 0);
}

module.exports = {
  selectRecentNotifications,
  selectRecentSessionRequestsForMentor,
  selectRecentSessionRequestsForMentee,
  selectPendingRequestsCount,
};
