const pool = require('../../config/database');

async function listSessionRequests({ userId, userType, status }) {
  const params = [userId];
  let where = '';
  if (userType === 'mentor') {
    where = 'sr.mentor_id = $1';
  } else if (userType === 'mentee') {
    where = 'sr.mentee_id = $1';
  } else {
    return { accessDenied: true };
  }

  let query = `
    SELECT sr.id,
           sr.title,
           sr.description,
           sr.preferred_date,
           sr.preferred_time,
           sr.duration_minutes,
           sr.status,
           sr.mentor_notes,
           sr.created_at,
           sr.updated_at,
           m.id AS mentor_id,
           m.name AS mentor_name,
           u.id AS mentee_id,
           u.name AS mentee_name,
           u.registration_number AS mentee_reg
    FROM session_requests sr
    JOIN users u ON u.id = sr.mentee_id
    JOIN users m ON m.id = sr.mentor_id
    WHERE ${where}
  `;

  if (status) {
    params.push(status);
    query += ' AND sr.status = $2';
  }

  query += ' ORDER BY sr.created_at DESC';

  const { rows } = await pool.query(query, params);
  return { rows };
}

async function findActiveMentorForMentee(menteeId) {
  return pool.query(
    `
      SELECT mentor_id
      FROM mentorship_relationships
      WHERE mentee_id = $1 AND status = 'active'
      ORDER BY start_date DESC
      LIMIT 1
    `,
    [menteeId]
  );
}

async function insertSessionRequest({
  menteeId,
  mentorId,
  title,
  description,
  preferred_date,
  preferred_time,
  duration_minutes,
}) {
  return pool.query(
    `
      INSERT INTO session_requests (mentee_id, mentor_id, title, description, preferred_date, preferred_time, duration_minutes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `,
    [
      menteeId,
      mentorId,
      title,
      description,
      preferred_date || null,
      preferred_time || null,
      duration_minutes,
    ]
  );
}

async function createSessionRequestNotification({ mentorId, title, requestId }) {
  return pool.query(
    `INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      mentorId,
      'New Session Request',
      `Session request: ${title}`,
      'session_request',
      'session_request',
      requestId,
    ]
  );
}

async function updateSessionRequestStatus({ requestId, mentorId, status, mentor_notes }) {
  return pool.query(
    `
      UPDATE session_requests
      SET status = $1, mentor_notes = COALESCE($2, mentor_notes), updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND mentor_id = $4
      RETURNING *
    `,
    [status, mentor_notes || null, requestId, mentorId]
  );
}

async function createStatusUpdateNotification({
  menteeId,
  status,
  preferred_date,
  preferred_time,
  requestId,
}) {
  const message = status === 'approved'
    ? `Scheduled for ${preferred_date || ''} ${preferred_time || ''}`
    : 'Your mentorship session request is rejected';

  return pool.query(
    `INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      menteeId,
      'Session Request Update',
      message,
      'session_status',
      'session_request',
      requestId,
    ]
  );
}

async function cancelPendingSessionRequest({ requestId, menteeId }) {
  return pool.query(
    `DELETE FROM session_requests WHERE id = $1 AND mentee_id = $2 AND status = 'pending' RETURNING *`,
    [requestId, menteeId]
  );
}

module.exports = {
  listSessionRequests,
  findActiveMentorForMentee,
  insertSessionRequest,
  createSessionRequestNotification,
  updateSessionRequestStatus,
  createStatusUpdateNotification,
  cancelPendingSessionRequest,
};
