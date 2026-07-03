const queries = require('./notifications.queries');

async function getNotifications(userId) {
  return queries.getNotificationsByUserId(userId);
}

async function getUnreadCount(userId) {
  const count = await queries.getUnreadCountByUserId(userId);
  return { count: parseInt(count) };
}

async function markAsRead(notificationId, userId) {
  return queries.markNotificationAsRead(notificationId, userId);
}

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
