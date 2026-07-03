const {
  listSessionRequests,
  findActiveMentorForMentee,
  insertSessionRequest,
  createSessionRequestNotification,
  updateSessionRequestStatus,
  createStatusUpdateNotification,
  cancelPendingSessionRequest,
} = require('./session-requests.queries');

async function getSessionRequests(user, status) {
  const result = await listSessionRequests({
    userId: user.userId,
    userType: user.userType,
    status,
  });

  if (result.accessDenied) {
    return { status: 403, body: { message: 'Access denied' } };
  }

  return { status: 200, body: result.rows };
}

async function createSessionRequest(user, {
  title,
  description,
  preferred_date,
  preferred_time,
  duration_minutes = 30,
}) {
  const mentorRes = await findActiveMentorForMentee(user.userId);
  let mentor_id = mentorRes.rows[0]?.mentor_id;
  if (!mentor_id) {
    const fallbackMentor = process.env.DEFAULT_MENTOR_ID;
    if (fallbackMentor) {
      mentor_id = fallbackMentor;
    } else {
      return {
        status: 400,
        body: {
          message: 'No active mentor linked to this mentee. Create a mentorship_relationships row or set DEFAULT_MENTOR_ID in config.env.',
        },
      };
    }
  }

  const { rows } = await insertSessionRequest({
    menteeId: user.userId,
    mentorId: mentor_id,
    title,
    description,
    preferred_date,
    preferred_time,
    duration_minutes,
  });

  try {
    await createSessionRequestNotification({
      mentorId: mentor_id,
      title,
      requestId: rows[0].id,
    });
  } catch {}

  return { status: 201, body: rows[0] };
}

async function updateStatus(user, requestId, { status, mentor_notes }) {
  const { rows } = await updateSessionRequestStatus({
    requestId,
    mentorId: user.userId,
    status,
    mentor_notes,
  });

  if (rows.length === 0) {
    return { status: 404, body: { message: 'Session request not found' } };
  }

  try {
    await createStatusUpdateNotification({
      menteeId: rows[0].mentee_id,
      status,
      preferred_date: rows[0].preferred_date,
      preferred_time: rows[0].preferred_time,
      requestId: rows[0].id,
    });
  } catch {}

  return { status: 200, body: rows[0] };
}

async function cancelRequest(user, requestId) {
  const { rows } = await cancelPendingSessionRequest({
    requestId,
    menteeId: user.userId,
  });

  if (rows.length === 0) {
    return { status: 404, body: { message: 'Request not found or not cancellable' } };
  }

  return { status: 200, body: { message: 'Request cancelled' } };
}

module.exports = {
  getSessionRequests,
  createSessionRequest,
  updateStatus,
  cancelRequest,
};
