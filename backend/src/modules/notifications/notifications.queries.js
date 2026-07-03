const pool = require('../../config/database');

async function getNotificationsByUserId(userId) {
  const query = `
      SELECT id, title, message, type, is_read, related_entity_type, related_entity_id, created_at
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

  const result = await pool.query(query, [userId]);
  return result.rows;
}

async function getUnreadCountByUserId(userId) {
  const query = `
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = $1 AND is_read = false
    `;

  const result = await pool.query(query, [userId]);
  return result.rows[0].count;
}

async function markNotificationAsRead(notificationId, userId) {
  const query = `
      UPDATE notifications
      SET is_read = true
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;

  const result = await pool.query(query, [notificationId, userId]);
  return result.rows[0] || null;
}

async function markAllNotificationsAsRead(userId) {
  const query = `
      UPDATE notifications
      SET is_read = true
      WHERE user_id = $1 AND is_read = false
      RETURNING id
    `;

  const result = await pool.query(query, [userId]);
  return result.rows;
}

module.exports = {
  getNotificationsByUserId,
  getUnreadCountByUserId,
  markNotificationAsRead,
  markAllNotificationsAsRead,
};
