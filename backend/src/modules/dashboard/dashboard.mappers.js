function formatDateDMY(isoDate) {
  if (!isoDate) return '';
  const d = String(isoDate).slice(0, 10);
  const [y, m, d2] = d.split('-');
  if (!y || !m || !d2) return d;
  return `${d2}-${m}-${y}`;
}

function formatTimeHM(time) {
  if (!time) return '';
  return String(time).slice(0, 5);
}

function mapMeetingActivity(meeting) {
  const status = (meeting.status || '').toLowerCase();
  let verb = 'Scheduled';
  if (status === 'completed') verb = 'Completed';
  else if (status === 'cancelled') verb = 'Cancelled';
  else if (status === 'scheduled' && meeting.updated_at) verb = 'Rescheduled';

  const when = meeting.meeting_date;
  const time = formatTimeHM(meeting.meeting_time);

  return {
    id: `meeting-${meeting.id}`,
    type: 'meeting',
    message: `${verb}: ${meeting.topic || meeting.title || 'Meeting'}`,
    time: `${formatDateDMY(when)} ${time}`.trim(),
    ts: meeting.updated_at || meeting.meeting_date || '',
    status: meeting.status,
  };
}

function mapSessionRequestActivity(request) {
  const status = (request.status || '').toLowerCase();
  const verb =
    status === 'approved' ? 'Approved' : status === 'rejected' ? 'Rejected' : 'Session Request';
  const when = request.preferred_date;
  const time = formatTimeHM(request.preferred_time);

  return {
    id: `request-${request.id}`,
    type: 'session_request',
    message: `${verb}: ${request.title}`,
    time: `${formatDateDMY(when)} ${time}`.trim(),
    ts: request.updated_at || request.created_at || '',
    status: request.status,
  };
}

function mapNotificationActivity(notification) {
  return {
    id: `notification-${notification.id}`,
    type: notification.type || 'notification',
    message: notification.message || notification.title || 'Notification',
    time: notification.created_at,
    ts: notification.created_at || '',
    title: notification.title,
    is_read: notification.is_read,
    status: notification.is_read ? 'read' : 'unread',
  };
}

function mergeActivity(items, limit = 10) {
  return items
    .sort((a, b) => String(b.ts).localeCompare(String(a.ts)))
    .slice(0, limit);
}

module.exports = {
  mapMeetingActivity,
  mapSessionRequestActivity,
  mapNotificationActivity,
  mergeActivity,
};
