const express = require('express');
const { body, validationResult } = require('express-validator');
const PDFDocument = require('pdfkit');
const pool = require('../config/database');
const authenticateRequest = require('../middleware/authenticate');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateRequest);
// Get meetings visible to a mentee (by group membership or attendance)
router.get('/for-mentee', async (req, res) => {
  try {
    if (req.user.userType !== 'mentee') {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { status } = req.query; // optional: 'scheduled' | 'completed'
    const params = [req.user.userId];
    let whereClauses = [
      // meetings for groups the mentee belongs to
      `m.group_id IN (SELECT gm.group_id FROM group_memberships gm WHERE gm.mentee_id = $1)`,
      // or meetings where mentee has attendance record
      `EXISTS (SELECT 1 FROM meeting_attendance ma WHERE ma.meeting_id = m.id AND ma.mentee_id = $1)`,
      // or meetings created by the mentee's active mentor (covers group-less meetings)
      `m.mentor_id IN (SELECT mr.mentor_id FROM mentorship_relationships mr WHERE mr.mentee_id = $1 AND mr.status = 'active')`
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
    res.json(result.rows);
  } catch (error) {
    console.error('Get mentee meetings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all meetings for a mentor
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    let query = `
      SELECT m.*, mg.name as group_name
      FROM meetings m
      LEFT JOIN meeting_groups mg ON m.group_id = mg.id
      WHERE m.mentor_id = $1
    `;
    const params = [req.user.userId];

    if (status) {
      query += ' AND m.status = $2';
      params.push(status);
    }

    query += ' ORDER BY m.meeting_date DESC, m.meeting_time DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get a specific meeting with attendance
router.get('/:id', async (req, res) => {
  try {
    const meetingId = req.params.id;

    // Get meeting details
    const meetingQuery = `
      SELECT m.*, mg.name as group_name
      FROM meetings m
      LEFT JOIN meeting_groups mg ON m.group_id = mg.id
      WHERE m.id = $1 AND m.mentor_id = $2
    `;
    const meetingResult = await pool.query(meetingQuery, [meetingId, req.user.userId]);

    if (meetingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    // Get attendance
    const attendanceQuery = `
      SELECT ma.*, u.name as mentee_name, u.registration_number
      FROM meeting_attendance ma
      JOIN users u ON ma.mentee_id = u.id
      WHERE ma.meeting_id = $1
    `;
    const attendanceResult = await pool.query(attendanceQuery, [meetingId]);

    const meeting = meetingResult.rows[0];
    meeting.attendance = attendanceResult.rows;

    res.json(meeting);
  } catch (error) {
    console.error('Get meeting error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new meeting
router.post('/', [
  body('title').notEmpty(),
  body('topic').notEmpty(),
  body('agenda').notEmpty(),
  body('meetingDate').isISO8601(),
  body('meetingTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('durationMinutes').isInt({ min: 15, max: 480 }),
  body('teamsLink').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      topic,
      agenda,
      meetingDate,
      meetingTime,
      durationMinutes = 60,
      teamsLink,
      groupId
    } = req.body;

    const insertQuery = `
      INSERT INTO meetings (mentor_id, group_id, title, topic, agenda, meeting_date, meeting_time, duration_minutes, teams_link)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      req.user.userId,
      groupId || null,
      title,
      topic,
      agenda,
      meetingDate,
      meetingTime,
      durationMinutes,
      teamsLink
    ]);

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a meeting
router.put('/:id', [
  body('title').optional().notEmpty(),
  body('topic').optional().notEmpty(),
  body('agenda').optional().notEmpty(),
  body('meetingDate').optional().isISO8601(),
  body('meetingTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('durationMinutes').optional().isInt({ min: 15, max: 480 }),
  body('teamsLink').optional().isURL(),
  body('status').optional().isIn(['scheduled', 'completed', 'cancelled'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const meetingId = req.params.id;
    const updates = req.body;

    // Build dynamic update query
    const setClause = [];
    const values = [];
    let paramCount = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        setClause.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
        paramCount++;
      }
    });

    if (setClause.length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    values.push(meetingId, req.user.userId);
    const query = `
      UPDATE meetings 
      SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount} AND mentor_id = $${paramCount + 1}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update meeting error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Complete a meeting (add notes and attendance)
router.post('/:id/complete', [
  body('comments').notEmpty(),
  body('actionPoints').notEmpty(),
  body('attendance').isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const meetingId = req.params.id;
    const { comments, actionPoints, attendance } = req.body;

    // Start transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update meeting with notes and mark as completed
      const updateMeetingQuery = `
        UPDATE meetings 
        SET comments = $1, action_points = $2, status = 'completed', updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 AND mentor_id = $4
        RETURNING *
      `;
      const meetingResult = await client.query(updateMeetingQuery, [
        comments, actionPoints, meetingId, req.user.userId
      ]);

      if (meetingResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ message: 'Meeting not found' });
      }

      // Clear existing attendance
      await client.query('DELETE FROM meeting_attendance WHERE meeting_id = $1', [meetingId]);

      // Insert new attendance records
      for (const menteeId of attendance) {
        await client.query(
          'INSERT INTO meeting_attendance (meeting_id, mentee_id, attended) VALUES ($1, $2, true)',
          [meetingId, menteeId]
        );
      }

      await client.query('COMMIT');
      res.json(meetingResult.rows[0]);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Complete meeting error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a meeting
router.delete('/:id', async (req, res) => {
  try {
    const meetingId = req.params.id;

    const deleteQuery = 'DELETE FROM meetings WHERE id = $1 AND mentor_id = $2 RETURNING *';
    const result = await pool.query(deleteQuery, [meetingId, req.user.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    res.json({ message: 'Meeting deleted successfully' });
  } catch (error) {
    console.error('Delete meeting error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get mentees for a mentor (for attendance selection)
router.get('/mentees/list', async (req, res) => {
  try {
    const menteesQuery = `
      SELECT u.id, u.name, u.registration_number, u.department
      FROM users u
      JOIN mentorship_relationships mr ON u.id = mr.mentee_id
      WHERE mr.mentor_id = $1 AND mr.status = 'active' AND u.is_active = true
      ORDER BY u.name
    `;

    const result = await pool.query(menteesQuery, [req.user.userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get mentees error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Download meeting notes and attendance as PDF (for completed meetings)
router.get('/:id/download', async (req, res) => {
  try {
    const meetingId = req.params.id;

    // Get meeting details
    const meetingQuery = `
      SELECT m.*, mg.name as group_name, u.name as mentor_name
      FROM meetings m
      LEFT JOIN meeting_groups mg ON m.group_id = mg.id
      JOIN users u ON m.mentor_id = u.id
      WHERE m.id = $1 AND m.mentor_id = $2
    `;
    const meetingResult = await pool.query(meetingQuery, [meetingId, req.user.userId]);

    if (meetingResult.rows.length === 0) {
      return res.status(404).json({ message: 'Meeting not found' });
    }

    const meeting = meetingResult.rows[0];

    // Only allow download for completed meetings
    if (meeting.status !== 'completed') {
      return res.status(400).json({ message: 'Meeting notes and attendance can only be downloaded for completed meetings' });
    }

    // Get attendance
    const attendanceQuery = `
      SELECT ma.*, u.name as mentee_name, u.registration_number, u.email
      FROM meeting_attendance ma
      JOIN users u ON ma.mentee_id = u.id
      WHERE ma.meeting_id = $1
      ORDER BY u.name
    `;
    const attendanceResult = await pool.query(attendanceQuery, [meetingId]);

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    const filename = `meeting_notes_${meeting.title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date(meeting.meeting_date).toISOString().split('T')[0]}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    // Helper function to add section
    const addSection = (title, startY) => {
      if (startY > doc.page.height - 100) {
        doc.addPage();
        startY = 50;
      }
      doc.fontSize(14).font('Helvetica-Bold').text(title, 50, startY, { underline: true });
      return startY + 25;
    };

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('MEETING NOTES & ATTENDANCE', 50, 50, { align: 'center' });
    doc.fontSize(12).font('Helvetica').text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80, { align: 'center' });
    
    let y = 120;

    // Meeting Details
    y = addSection('MEETING DETAILS', y);
    
    const meetingDetails = {
      'Title': meeting.title,
      'Topic': meeting.topic,
      'Date': new Date(meeting.meeting_date).toLocaleDateString(),
      'Time': meeting.meeting_time ? meeting.meeting_time.slice(0, 5) : 'N/A',
      'Duration': meeting.duration_minutes ? `${meeting.duration_minutes} minutes` : 'N/A',
      'Mentor': meeting.mentor_name,
      'Group': meeting.group_name || 'N/A',
      'Status': meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)
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

    // Agenda
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

    // Meeting Notes/Comments
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

    // Action Points
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

    // Attendance
    y = addSection('ATTENDANCE', y);
    if (y > doc.page.height - 100) {
      doc.addPage();
      y = 50;
      doc.fontSize(14).font('Helvetica-Bold').text('ATTENDANCE', 50, y, { underline: true });
      y += 25;
    }

    if (attendanceResult.rows.length > 0) {
      // Table header
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

      // Attendance rows
      attendanceResult.rows.forEach((attendance, index) => {
        if (y > doc.page.height - 80) {
          doc.addPage();
          y = 50;
          // Redraw header
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

      // Summary
      y += 10;
      if (y > doc.page.height - 60) {
        doc.addPage();
        y = 50;
      }
      const presentCount = attendanceResult.rows.filter(a => a.attended).length;
      const totalCount = attendanceResult.rows.length;
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

    // Footer
    const pageHeight = doc.page.height;
    doc.fontSize(8)
       .font('Helvetica')
       .text(`This document was generated on ${new Date().toLocaleString()}`, 50, pageHeight - 50, { align: 'center' });

    doc.end();

  } catch (error) {
    console.error('Download meeting PDF error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

module.exports = router;
