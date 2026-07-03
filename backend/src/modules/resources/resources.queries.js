const pool = require('../../config/database');

async function selectUserType(userId) {
  const result = await pool.query('SELECT user_type FROM users WHERE id = $1', [userId]);
  return result.rows[0]?.user_type;
}

async function selectActiveMentorIdForMentee(menteeId) {
  const result = await pool.query(
    `
      SELECT mentor_id
      FROM mentorship_relationships
      WHERE mentee_id = $1 AND status = 'active'
      LIMIT 1
    `,
    [menteeId]
  );
  return result.rows.length > 0 ? result.rows[0].mentor_id : null;
}

async function selectResourcesByUploader(uploaderId) {
  const result = await pool.query(
    `
      SELECT r.*, u.name as uploaded_by_name
      FROM resources r
      JOIN users u ON r.uploaded_by = u.id
      WHERE r.uploaded_by = $1
      ORDER BY r.created_at DESC
    `,
    [uploaderId]
  );
  return result.rows;
}

async function selectNoResources() {
  const result = await pool.query(
    `
      SELECT r.*, u.name as uploaded_by_name
      FROM resources r
      JOIN users u ON r.uploaded_by = u.id
      WHERE 1 = 0
      ORDER BY r.created_at DESC
    `
  );
  return result.rows;
}

async function insertResource({
  title,
  description,
  resourceType,
  fileUrl,
  fileSize,
  mimeType,
  uploadedBy,
  isPublic,
}) {
  const result = await pool.query(
    `
      INSERT INTO resources (
        title, description, resource_type, file_url, file_size, mime_type,
        uploaded_by, is_public
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `,
    [title, description, resourceType, fileUrl, fileSize, mimeType, uploadedBy, isPublic]
  );
  return result.rows[0];
}

async function selectMenteeIdsByMentor(mentorId) {
  const result = await pool.query(
    `
      SELECT mentee_id
      FROM mentorship_relationships
      WHERE mentor_id = $1 AND status = 'active'
    `,
    [mentorId]
  );
  return result.rows;
}

async function insertResourceNotification({
  userId,
  title,
  message,
  relatedEntityId,
}) {
  await pool.query(
    `
      INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [userId, title, message, 'resource_added', 'resource', relatedEntityId]
  );
}

module.exports = {
  selectUserType,
  selectActiveMentorIdForMentee,
  selectResourcesByUploader,
  selectNoResources,
  insertResource,
  selectMenteeIdsByMentor,
  insertResourceNotification,
};
