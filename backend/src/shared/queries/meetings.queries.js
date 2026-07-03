const pool = require('../../config/database');

async function selectMentorUpcomingMeetings(mentorId, limit = 5) {
  const query = `
    SELECT m.id, m.topic, m.title, m.meeting_date, m.meeting_time, m.teams_link, m.status, m.updated_at
    FROM meetings m
    WHERE m.mentor_id = $1 AND m.status = 'scheduled'
    ORDER BY m.meeting_date ASC, m.meeting_time ASC
    LIMIT $2
  `;
  const result = await pool.query(query, [mentorId, limit]);
  return result.rows;
}

async function selectMenteeUpcomingMeetings(menteeId, limit = 5) {
  const query = `
    SELECT DISTINCT m.id, m.topic, m.title, m.meeting_date, m.meeting_time, m.teams_link, m.status, m.updated_at
    FROM meetings m
    WHERE (
      m.group_id IN (SELECT gm.group_id FROM group_memberships gm WHERE gm.mentee_id = $1)
      OR EXISTS (SELECT 1 FROM meeting_attendance ma WHERE ma.meeting_id = m.id AND ma.mentee_id = $1)
      OR m.mentor_id IN (SELECT mr.mentor_id FROM mentorship_relationships mr WHERE mr.mentee_id = $1 AND mr.status = 'active')
    )
    AND m.status = 'scheduled'
    ORDER BY m.meeting_date ASC, m.meeting_time ASC
    LIMIT $2
  `;
  const result = await pool.query(query, [menteeId, limit]);
  return result.rows;
}

async function selectRecentMeetingsForMentor(mentorId, limit = 10) {
  const query = `
    SELECT m.id, m.topic, m.title, m.meeting_date, m.meeting_time, m.status, m.updated_at
    FROM meetings m
    WHERE m.mentor_id = $1
    ORDER BY COALESCE(m.updated_at, m.meeting_date) DESC
    LIMIT $2
  `;
  const result = await pool.query(query, [mentorId, limit]);
  return result.rows;
}

module.exports = {
  selectMentorUpcomingMeetings,
  selectMenteeUpcomingMeetings,
  selectRecentMeetingsForMentor,
};
