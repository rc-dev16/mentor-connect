const pool = require('../../config/database');

async function selectMeetingsForMentee(menteeId, status) {
  const params = [menteeId];
  const whereClauses = [
    `m.group_id IN (SELECT gm.group_id FROM group_memberships gm WHERE gm.mentee_id = $1)`,
    `EXISTS (SELECT 1 FROM meeting_attendance ma WHERE ma.meeting_id = m.id AND ma.mentee_id = $1)`,
    `m.mentor_id IN (SELECT mr.mentor_id FROM mentorship_relationships mr WHERE mr.mentee_id = $1 AND mr.status = 'active')`,
  ];
  let where = `(${whereClauses.join(' OR ')})`;
  if (status) {
    params.push(status);
    where += ` AND m.status = $2`;
  }

  const query = `
    SELECT DISTINCT m.*
    FROM meetings m
    WHERE ${where}
    ORDER BY m.meeting_date DESC, m.meeting_time DESC
  `;
  const result = await pool.query(query, params);
  return result.rows;
}

async function selectMeetingsForMentor(mentorId, status) {
  let query = `
    SELECT m.*, mg.name as group_name
    FROM meetings m
    LEFT JOIN meeting_groups mg ON m.group_id = mg.id
    WHERE m.mentor_id = $1
  `;
  const params = [mentorId];

  if (status) {
    query += ' AND m.status = $2';
    params.push(status);
  }

  query += ' ORDER BY m.meeting_date DESC, m.meeting_time DESC';

  const result = await pool.query(query, params);
  return result.rows;
}

async function selectMeetingById(meetingId, mentorId) {
  const query = `
    SELECT m.*, mg.name as group_name
    FROM meetings m
    LEFT JOIN meeting_groups mg ON m.group_id = mg.id
    WHERE m.id = $1 AND m.mentor_id = $2
  `;
  const result = await pool.query(query, [meetingId, mentorId]);
  return result.rows[0] || null;
}

async function selectAttendanceByMeetingId(meetingId) {
  const query = `
    SELECT ma.*, u.name as mentee_name, u.registration_number
    FROM meeting_attendance ma
    JOIN users u ON ma.mentee_id = u.id
    WHERE ma.meeting_id = $1
  `;
  const result = await pool.query(query, [meetingId]);
  return result.rows;
}

async function insertMeeting({
  mentorId,
  groupId,
  title,
  topic,
  agenda,
  meetingDate,
  meetingTime,
  durationMinutes,
  teamsLink,
}) {
  const insertQuery = `
    INSERT INTO meetings (mentor_id, group_id, title, topic, agenda, meeting_date, meeting_time, duration_minutes, teams_link)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;

  const result = await pool.query(insertQuery, [
    mentorId,
    groupId || null,
    title,
    topic,
    agenda,
    meetingDate,
    meetingTime,
    durationMinutes,
    teamsLink,
  ]);

  return result.rows[0];
}

async function updateMeeting(meetingId, mentorId, updates) {
  const setClause = [];
  const values = [];
  let paramCount = 1;

  Object.keys(updates).forEach((key) => {
    if (updates[key] !== undefined) {
      setClause.push(`${key} = $${paramCount}`);
      values.push(updates[key]);
      paramCount++;
    }
  });

  if (setClause.length === 0) {
    return { noFields: true };
  }

  values.push(meetingId, mentorId);
  const query = `
    UPDATE meetings 
    SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${paramCount} AND mentor_id = $${paramCount + 1}
    RETURNING *
  `;

  const result = await pool.query(query, values);
  return { row: result.rows[0] || null };
}

async function completeMeetingWithAttendance({
  meetingId,
  mentorId,
  comments,
  actionPoints,
  attendance,
}) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const updateMeetingQuery = `
      UPDATE meetings 
      SET comments = $1, action_points = $2, status = 'completed', updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND mentor_id = $4
      RETURNING *
    `;
    const meetingResult = await client.query(updateMeetingQuery, [
      comments,
      actionPoints,
      meetingId,
      mentorId,
    ]);

    if (meetingResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return null;
    }

    await client.query('DELETE FROM meeting_attendance WHERE meeting_id = $1', [meetingId]);

    for (const menteeId of attendance) {
      await client.query(
        'INSERT INTO meeting_attendance (meeting_id, mentee_id, attended) VALUES ($1, $2, true)',
        [meetingId, menteeId]
      );
    }

    await client.query('COMMIT');
    return meetingResult.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function deleteMeeting(meetingId, mentorId) {
  const deleteQuery = 'DELETE FROM meetings WHERE id = $1 AND mentor_id = $2 RETURNING *';
  const result = await pool.query(deleteQuery, [meetingId, mentorId]);
  return result.rows[0] || null;
}

async function selectMenteesForMentor(mentorId) {
  const menteesQuery = `
    SELECT u.id, u.name, u.registration_number, u.department
    FROM users u
    JOIN mentorship_relationships mr ON u.id = mr.mentee_id
    WHERE mr.mentor_id = $1 AND mr.status = 'active' AND u.is_active = true
    ORDER BY u.name
  `;

  const result = await pool.query(menteesQuery, [mentorId]);
  return result.rows;
}

async function selectMeetingForDownload(meetingId, mentorId) {
  const meetingQuery = `
    SELECT m.*, mg.name as group_name, u.name as mentor_name
    FROM meetings m
    LEFT JOIN meeting_groups mg ON m.group_id = mg.id
    JOIN users u ON m.mentor_id = u.id
    WHERE m.id = $1 AND m.mentor_id = $2
  `;
  const result = await pool.query(meetingQuery, [meetingId, mentorId]);
  return result.rows[0] || null;
}

async function selectAttendanceForDownload(meetingId) {
  const attendanceQuery = `
    SELECT ma.*, u.name as mentee_name, u.registration_number, u.email
    FROM meeting_attendance ma
    JOIN users u ON ma.mentee_id = u.id
    WHERE ma.meeting_id = $1
    ORDER BY u.name
  `;
  const result = await pool.query(attendanceQuery, [meetingId]);
  return result.rows;
}

module.exports = {
  selectMeetingsForMentee,
  selectMeetingsForMentor,
  selectMeetingById,
  selectAttendanceByMeetingId,
  insertMeeting,
  updateMeeting,
  completeMeetingWithAttendance,
  deleteMeeting,
  selectMenteesForMentor,
  selectMeetingForDownload,
  selectAttendanceForDownload,
};
