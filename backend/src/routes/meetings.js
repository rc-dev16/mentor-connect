const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Apply authentication to all routes
router.use(authenticateToken);
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

module.exports = router;
