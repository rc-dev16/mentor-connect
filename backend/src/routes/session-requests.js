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

router.use(authenticateToken);

// Get session requests for a mentor
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const params = [req.user.userId];
    let where = '';
    if (req.user.userType === 'mentor') {
      where = 'sr.mentor_id = $1';
    } else if (req.user.userType === 'mentee') {
      where = 'sr.mentee_id = $1';
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    let query = `
      SELECT sr.id,
             sr.title,
             sr.description,
             sr.preferred_date,
             sr.preferred_time,
             sr.duration_minutes,
             sr.status,
             sr.mentor_notes,
             sr.created_at,
             sr.updated_at,
             m.id AS mentor_id,
             m.name AS mentor_name,
             u.id AS mentee_id,
             u.name AS mentee_name,
             u.registration_number AS mentee_reg
      FROM session_requests sr
      JOIN users u ON u.id = sr.mentee_id
      JOIN users m ON m.id = sr.mentor_id
      WHERE ${where}
    `;

    if (status) {
      params.push(status);
      query += ' AND sr.status = $2';
    }

    query += ' ORDER BY sr.created_at DESC';

    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Get session requests error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new session request (mentee)
router.post('/', [
  body('title').notEmpty(),
  body('description').notEmpty(),
  body('preferred_date').isISO8601(),
  body('preferred_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('duration_minutes').optional().isInt({ min: 15, max: 480 })
], async (req, res) => {
  try {
    if (req.user.userType !== 'mentee') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, preferred_date, preferred_time, duration_minutes = 30 } = req.body;

    // Find active mentor for this mentee
    const mentorQuery = `
      SELECT mentor_id
      FROM mentorship_relationships
      WHERE mentee_id = $1 AND status = 'active'
      ORDER BY start_date DESC
      LIMIT 1
    `;
    const mentorRes = await pool.query(mentorQuery, [req.user.userId]);
    let mentor_id = mentorRes.rows[0]?.mentor_id;
    if (!mentor_id) {
      // Fallback: allow DEFAULT_MENTOR_ID from env for development
      const fallbackMentor = process.env.DEFAULT_MENTOR_ID;
      if (fallbackMentor) {
        mentor_id = fallbackMentor;
      } else {
        return res.status(400).json({ message: 'No active mentor linked to this mentee. Create a mentorship_relationships row or set DEFAULT_MENTOR_ID in config.env.' });
      }
    }

    const insertQuery = `
      INSERT INTO session_requests (mentee_id, mentor_id, title, description, preferred_date, preferred_time, duration_minutes)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const { rows } = await pool.query(insertQuery, [
      req.user.userId,
      mentor_id,
      title,
      description,
      preferred_date || null,
      preferred_time || null,
      duration_minutes
    ]);

    // Create notification for mentor
    try {
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          mentor_id,
          'New Session Request',
          `Session request: ${title}`,
          'session_request',
          'session_request',
          rows[0].id
        ]
      );
    } catch {}

    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Create session request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update session request status (mentor approves/rejects)
router.put('/:id/status', [
  body('status').isIn(['pending', 'approved', 'rejected']),
  body('mentor_notes').optional().isString()
], async (req, res) => {
  try {
    if (req.user.userType !== 'mentor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const requestId = req.params.id;
    const { status, mentor_notes } = req.body;

    const updateQuery = `
      UPDATE session_requests
      SET status = $1, mentor_notes = COALESCE($2, mentor_notes), updated_at = CURRENT_TIMESTAMP
      WHERE id = $3 AND mentor_id = $4
      RETURNING *
    `;

    const { rows } = await pool.query(updateQuery, [status, mentor_notes || null, requestId, req.user.userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Session request not found' });
    }

    // Create notification for mentee
    try {
      const message = status === 'approved'
        ? `Scheduled for ${rows[0].preferred_date || ''} ${rows[0].preferred_time || ''}`
        : 'Your mentorship session request is rejected';
      await pool.query(
        `INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          rows[0].mentee_id,
          'Session Request Update',
          message,
          'session_status',
          'session_request',
          rows[0].id
        ]
      );
    } catch {}

    res.json(rows[0]);
  } catch (error) {
    console.error('Update session request status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cancel a pending session request (mentee)
router.delete('/:id', async (req, res) => {
  try {
    if (req.user.userType !== 'mentee') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const requestId = req.params.id;
    // Only delete if it belongs to this mentee and is still pending
    const { rows } = await pool.query(
      `DELETE FROM session_requests WHERE id = $1 AND mentee_id = $2 AND status = 'pending' RETURNING *`,
      [requestId, req.user.userId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Request not found or not cancellable' });
    }
    res.json({ message: 'Request cancelled' });
  } catch (error) {
    console.error('Cancel session request error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;


