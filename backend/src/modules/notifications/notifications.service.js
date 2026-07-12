// @ts-check
const queries = require('./notifications.queries');

/**
 * @typedef {import('@shared/contracts/notifications').Notification} Notification
 * @typedef {import('@shared/contracts/notifications').UnreadCountResponse} UnreadCountResponse
 * @typedef {import('@shared/contracts/notifications').MarkAllReadResponse} MarkAllReadResponse
 */

/**
 * @param {string} userId
 * @returns {Promise<Notification[]>}
 */
async function getNotifications(userId) {
  return queries.getNotificationsByUserId(userId);
}

/**
 * @param {string} userId
 * @returns {Promise<UnreadCountResponse>}
 */
async function getUnreadCount(userId) {
  const count = await queries.getUnreadCountByUserId(userId);
  return { count: parseInt(count) };
}

/**
 * @param {string} notificationId
 * @param {string} userId
 * @returns {Promise<*>}
 */
async function markAsRead(notificationId, userId) {
  return queries.markNotificationAsRead(notificationId, userId);
}

/**
 * @param {string} userId
 * @returns {Promise<MarkAllReadResponse>}
 */
async function markAllAsRead(userId) {
  const rows = await queries.markAllNotificationsAsRead(userId);
  return { message: 'All notifications marked as read', count: rows.length };
}

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};
