// @ts-check
const PDFDocument = require('pdfkit');
const queries = require('./meetings.queries');

/**
 * @typedef {import('@shared/contracts/common').ApiMessage} ApiMessage
 * @typedef {import('@shared/contracts/common').UserType} UserType
 * @typedef {import('@shared/contracts/meetings').Meeting} Meeting
 * @typedef {import('@shared/contracts/meetings').MeetingSummary} MeetingSummary
 * @typedef {import('@shared/contracts/meetings').CreateMeetingInput} CreateMeetingInput
 * @typedef {import('@shared/contracts/meetings').UpdateMeetingInput} UpdateMeetingInput
 * @typedef {import('@shared/contracts/meetings').CompleteMeetingInput} CompleteMeetingInput
 * @typedef {import('@shared/contracts/users').MenteeListItem} MenteeListItem
 */

/**
 * @param {UserType} userType
 * @param {string} menteeId
 * @param {string} [status]
 * @returns {Promise<import('@shared/contracts/common').ApiResult<MeetingSummary[] | ApiMessage>>}
 */
async function getMeetingsForMentee(userType, menteeId, status) {
  if (userType !== 'mentee') {
    return { status: 403, body: { message: 'Access denied' } };
  }

  const rows = await queries.selectMeetingsForMentee(menteeId, status);
  return { status: 200, body: rows };
}

/**
 * @param {string} mentorId
 * @param {string} [status]
 * @returns {Promise<import('@shared/contracts/common').ApiResult<MeetingSummary[]>>}
 */
async function getMeetingsForMentor(mentorId, status) {
  const rows = await queries.selectMeetingsForMentor(mentorId, status);
  return { status: 200, body: rows };
}

/**
 * @param {string} meetingId
 * @param {string} mentorId
 * @returns {Promise<import('@shared/contracts/common').ApiResult<Meeting | ApiMessage>>}
 */
async function getMeetingById(meetingId, mentorId) {
  const meeting = await queries.selectMeetingById(meetingId, mentorId);

  if (!meeting) {
    return { status: 404, body: { message: 'Meeting not found' } };
  }

  meeting.attendance = await queries.selectAttendanceByMeetingId(meetingId);
  return { status: 200, body: meeting };
}

/**
 * @param {string} mentorId
 * @param {CreateMeetingInput} body
 * @returns {Promise<import('@shared/contracts/common').ApiResult<MeetingSummary>>}
 */
async function createMeeting(mentorId, body) {
  const {
    title,
    topic,
    agenda,
    meetingDate,
    meetingTime,
    durationMinutes = 60,
    teamsLink,
    groupId,
  } = body;

  const meeting = await queries.insertMeeting({
    mentorId,
    groupId,
    title,
    topic,
    agenda,
    meetingDate,
    meetingTime,
    durationMinutes,
    teamsLink,
  });

  return { status: 201, body: meeting };
}

/**
 * @param {string} meetingId
 * @param {string} mentorId
 * @param {UpdateMeetingInput} updates
 * @returns {Promise<import('@shared/contracts/common').ApiResult<MeetingSummary | ApiMessage>>}
 */
async function updateMeeting(meetingId, mentorId, updates) {
  const result = await queries.updateMeeting(meetingId, mentorId, updates);

  if (result.noFields) {
    return { status: 400, body: { message: 'No valid fields to update' } };
  }

  if (!result.row) {
    return { status: 404, body: { message: 'Meeting not found' } };
  }

  return { status: 200, body: result.row };
}

/**
 * @param {string} meetingId
 * @param {string} mentorId
 * @param {CompleteMeetingInput} payload
 * @returns {Promise<import('@shared/contracts/common').ApiResult<MeetingSummary | ApiMessage>>}
 */
async function completeMeeting(meetingId, mentorId, { comments, actionPoints, attendance }) {
  const meeting = await queries.completeMeetingWithAttendance({
    meetingId,
    mentorId,
    comments,
    actionPoints,
    attendance,
  });

  if (!meeting) {
    return { status: 404, body: { message: 'Meeting not found' } };
  }

  return { status: 200, body: meeting };
}

/**
 * @param {string} meetingId
 * @param {string} mentorId
 * @returns {Promise<import('@shared/contracts/common').ApiResult<ApiMessage>>}
 */
async function deleteMeeting(meetingId, mentorId) {
  const meeting = await queries.deleteMeeting(meetingId, mentorId);

  if (!meeting) {
    return { status: 404, body: { message: 'Meeting not found' } };
  }

  return { status: 200, body: { message: 'Meeting deleted successfully' } };
}

/**
 * @param {string} mentorId
 * @returns {Promise<import('@shared/contracts/common').ApiResult<MenteeListItem[]>>}
 */
async function getMenteesList(mentorId) {
  const rows = await queries.selectMenteesForMentor(mentorId);
  return { status: 200, body: rows };
}

function generateMeetingPdf(meeting, attendanceRows, res) {
  const doc = new PDFDocument({ margin: 50 });
  const filename = `meeting_notes_${meeting.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date(meeting.meeting_date).toISOString().split('T')[0]}.pdf`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  doc.pipe(res);

  const addSection = (title, startY) => {
    if (startY > doc.page.height - 100) {
      doc.addPage();
      startY = 50;
    }
    doc.fontSize(14).font('Helvetica-Bold').text(title, 50, startY, { underline: true });
    return startY + 25;
  };

  doc.fontSize(20).font('Helvetica-Bold').text('MEETING NOTES & ATTENDANCE', 50, 50, { align: 'center' });
  doc.fontSize(12).font('Helvetica').text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80, { align: 'center' });

  let y = 120;

  y = addSection('MEETING DETAILS', y);

  const meetingDetails = {
    Title: meeting.title,
    Topic: meeting.topic,
    Date: new Date(meeting.meeting_date).toLocaleDateString(),
    Time: meeting.meeting_time ? meeting.meeting_time.slice(0, 5) : 'N/A',
    Duration: meeting.duration_minutes ? `${meeting.duration_minutes} minutes` : 'N/A',
    Mentor: meeting.mentor_name,
    Group: meeting.group_name || 'N/A',
    Status: meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1),
  };

  Object.entries(meetingDetails).forEach(([key, value]) => {
    if (y > doc.page.height - 80) {
      doc.addPage();
      y = 50;
    }
    doc.fontSize(10)
      .font('Helvetica-Bold')
      .text(`${key}:`, 60, y);
    doc.font('Helvetica')
      .text(value || 'N/A', 200, y, { width: 300 });
    y += 20;
  });

  y += 10;

  if (meeting.agenda) {
    y = addSection('AGENDA', y);
    if (y > doc.page.height - 100) {
      doc.addPage();
      y = 50;
      doc.fontSize(14).font('Helvetica-Bold').text('AGENDA', 50, y, { underline: true });
      y += 25;
    }
    doc.fontSize(10).font('Helvetica').text(meeting.agenda, 60, y, { width: 450 });
    const agendaLines = Math.max(1, Math.ceil(meeting.agenda.length / 60));
    y += (agendaLines * 15) + 20;
  }

  if (meeting.comments) {
    y = addSection('MEETING NOTES / COMMENTS', y);
    if (y > doc.page.height - 100) {
      doc.addPage();
      y = 50;
      doc.fontSize(14).font('Helvetica-Bold').text('MEETING NOTES / COMMENTS', 50, y, { underline: true });
      y += 25;
    }
    doc.fontSize(10).font('Helvetica').text(meeting.comments, 60, y, { width: 450 });
    const commentsLines = Math.max(1, Math.ceil(meeting.comments.length / 60));
    y += (commentsLines * 15) + 20;
  }

  if (meeting.action_points) {
    y = addSection('ACTION POINTS', y);
    if (y > doc.page.height - 100) {
      doc.addPage();
      y = 50;
      doc.fontSize(14).font('Helvetica-Bold').text('ACTION POINTS', 50, y, { underline: true });
      y += 25;
    }
    doc.fontSize(10).font('Helvetica').text(meeting.action_points, 60, y, { width: 450 });
    const actionPointsLines = Math.max(1, Math.ceil(meeting.action_points.length / 60));
    y += (actionPointsLines * 15) + 20;
  }

  y = addSection('ATTENDANCE', y);
  if (y > doc.page.height - 100) {
    doc.addPage();
    y = 50;
    doc.fontSize(14).font('Helvetica-Bold').text('ATTENDANCE', 50, y, { underline: true });
    y += 25;
  }

  if (attendanceRows.length > 0) {
    if (y > doc.page.height - 100) {
      doc.addPage();
      y = 50;
    }
    doc.fontSize(10).font('Helvetica-Bold');
    doc.text('S.No.', 60, y);
    doc.text('Name', 120, y);
    doc.text('Registration Number', 250, y);
    doc.text('Status', 400, y);
    y += 20;
    doc.moveTo(50, y).lineTo(500, y).stroke();
    y += 10;

    attendanceRows.forEach((attendance, index) => {
      if (y > doc.page.height - 80) {
        doc.addPage();
        y = 50;
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('S.No.', 60, y);
        doc.text('Name', 120, y);
        doc.text('Registration Number', 250, y);
        doc.text('Status', 400, y);
        y += 20;
        doc.moveTo(50, y).lineTo(500, y).stroke();
        y += 10;
      }

      doc.fontSize(9).font('Helvetica');
      doc.text(String(index + 1), 60, y);
      doc.text(attendance.mentee_name || 'N/A', 120, y, { width: 120 });
      doc.text(attendance.registration_number || 'N/A', 250, y, { width: 140 });
      doc.font('Helvetica-Bold').text(attendance.attended ? 'Present' : 'Absent', 400, y);
      y += 20;
    });

    y += 10;
    if (y > doc.page.height - 60) {
      doc.addPage();
      y = 50;
    }
    const presentCount = attendanceRows.filter((a) => a.attended).length;
    const totalCount = attendanceRows.length;
    doc.fontSize(10).font('Helvetica-Bold').text('Summary:', 60, y);
    y += 15;
    doc.font('Helvetica').text(`Total Attendees: ${totalCount}`, 80, y);
    y += 15;
    doc.text(`Present: ${presentCount}`, 80, y);
    y += 15;
    doc.text(`Absent: ${totalCount - presentCount}`, 80, y);
  } else {
    doc.fontSize(10).font('Helvetica').text('No attendance records found.', 60, y);
  }

  const pageHeight = doc.page.height;
  doc.fontSize(8)
    .font('Helvetica')
    .text(`This document was generated on ${new Date().toLocaleString()}`, 50, pageHeight - 50, { align: 'center' });

  doc.end();
}

/**
 * @param {string} meetingId
 * @param {string} mentorId
 * @param {*} res
 * @returns {Promise<{ streamed: true } | import('@shared/contracts/common').ApiResult<ApiMessage>>}
 */
async function downloadMeetingPdf(meetingId, mentorId, res) {
  const meeting = await queries.selectMeetingForDownload(meetingId, mentorId);

  if (!meeting) {
    return { status: 404, body: { message: 'Meeting not found' } };
  }

  if (meeting.status !== 'completed') {
    return {
      status: 400,
      body: { message: 'Meeting notes and attendance can only be downloaded for completed meetings' },
    };
  }

  const attendanceRows = await queries.selectAttendanceForDownload(meetingId);
  generateMeetingPdf(meeting, attendanceRows, res);
  return { streamed: true };
}

module.exports = {
  getMeetingsForMentee,
  getMeetingsForMentor,
  getMeetingById,
  createMeeting,
  updateMeeting,
  completeMeeting,
  deleteMeeting,
  getMenteesList,
  downloadMeetingPdf,
};
