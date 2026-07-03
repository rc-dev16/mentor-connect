const { getProfileSnippet, getMentorForMentee } = require('../../shared/queries/profile.queries');
const {
  selectMentorUpcomingMeetings,
  selectMenteeUpcomingMeetings,
  selectRecentMeetingsForMentor,
} = require('../../shared/queries/meetings.queries');
const {
  selectRecentNotifications,
  selectRecentSessionRequestsForMentor,
  selectRecentSessionRequestsForMentee,
  selectPendingRequestsCount,
} = require('../../shared/queries/activity.queries');
const {
  selectTotalMenteesCount,
  selectUpcomingMeetingsCount,
  selectCompletedSessionsCount,
} = require('../users/users.queries');
const {
  mapMeetingActivity,
  mapSessionRequestActivity,
  mapNotificationActivity,
  mergeActivity,
} = require('./dashboard.mappers');

async function getMentorSummary(user) {
  const mentorId = user.userId;

  const [
    profile,
    totalMenteesRes,
    upcomingRes,
    completedRes,
    pendingRequests,
    upcomingMeetings,
    recentMeetings,
    recentRequests,
  ] = await Promise.all([
    getProfileSnippet(mentorId),
    selectTotalMenteesCount(mentorId),
    selectUpcomingMeetingsCount(mentorId),
    selectCompletedSessionsCount(mentorId),
    selectPendingRequestsCount(mentorId),
    selectMentorUpcomingMeetings(mentorId, 5),
    selectRecentMeetingsForMentor(mentorId, 10),
    selectRecentSessionRequestsForMentor(mentorId, 10),
  ]);

  const activity = mergeActivity(
    [
      ...recentMeetings.map(mapMeetingActivity),
      ...recentRequests.map(mapSessionRequestActivity),
    ],
    10
  );

  return {
    profile: profile || { id: mentorId },
    stats: {
      totalMentees: Number(totalMenteesRes.rows[0]?.count || 0),
      upcomingMeetings: Number(upcomingRes.rows[0]?.count || 0),
      pendingRequests,
      completedSessions: Number(completedRes.rows[0]?.count || 0),
    },
    upcomingMeetings,
    recentActivity: activity,
  };
}

async function getMenteeSummary(user) {
  const menteeId = user.userId;

  const [profile, mentor, upcomingMeetings, notifications, sessionRequests] = await Promise.all([
    getProfileSnippet(menteeId),
    getMentorForMentee(menteeId).catch(() => null),
    selectMenteeUpcomingMeetings(menteeId, 5),
    selectRecentNotifications(menteeId, 10),
    selectRecentSessionRequestsForMentee(menteeId, 10),
  ]);

  const activity = mergeActivity(
    [
      ...notifications.map(mapNotificationActivity),
      ...sessionRequests.map(mapSessionRequestActivity),
    ],
    10
  );

  return {
    profile: profile || { id: menteeId },
    mentor: mentor || null,
    upcomingMeetings,
    recentActivity: activity,
  };
}

async function getSummary(user) {
  if (user.userType === 'mentor') {
    return getMentorSummary(user);
  }
  if (user.userType === 'mentee') {
    return getMenteeSummary(user);
  }
  return { status: 403, body: { message: 'Access denied' } };
}

module.exports = {
  getSummary,
};
