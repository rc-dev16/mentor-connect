const express = require('express');
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

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const query = 'SELECT id, email, name, user_type, registration_number, department, phone, bio, created_at FROM users WHERE id = $1';
    const result = await pool.query(query, [req.user.userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get active mentor for the logged-in mentee
router.get('/my-mentor', async (req, res) => {
  try {
    if (req.user.userType !== 'mentee') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const query = `
      SELECT u.id, u.name, u.email, u.phone
      FROM mentorship_relationships mr
      JOIN users u ON u.id = mr.mentor_id
      WHERE mr.mentee_id = $1 AND mr.status = 'active'
      ORDER BY mr.start_date DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [req.user.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No active mentor found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get my mentor error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get mentees for a mentor
router.get('/mentees', async (req, res) => {
  try {
    if (req.user.userType !== 'mentor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const query = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.registration_number, 
        u.department, 
        u.phone, 
        u.bio,
        mr.status as mentorship_status,
        EXISTS (
          SELECT 1 FROM personal_information pi WHERE pi.user_id = u.id
        ) AS has_personal_info
      FROM users u
      JOIN mentorship_relationships mr ON u.id = mr.mentee_id
      WHERE mr.mentor_id = $1 AND u.is_active = true
      ORDER BY u.name
    `;

    const result = await pool.query(query, [req.user.userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get mentees error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Dashboard stats for a mentor
router.get('/dashboard/stats', async (req, res) => {
  try {
    const mentorId = req.user.userId;

    // Total mentees (active relationships and active users)
    const totalMenteesQuery = `
      SELECT COUNT(*) AS count
      FROM mentorship_relationships mr
      JOIN users u ON u.id = mr.mentee_id
      WHERE mr.mentor_id = $1 AND mr.status = 'active' AND u.is_active = true
    `;

    // Upcoming meetings in the next 7 days with status scheduled
    const upcomingMeetingsQuery = `
      SELECT COUNT(*) AS count
      FROM meetings m
      WHERE m.mentor_id = $1 
        AND m.status = 'scheduled'
        AND m.meeting_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
    `;

    // Sessions completed (all-time)
    const completedSessionsQuery = `
      SELECT COUNT(*) AS count
      FROM meetings m
      WHERE m.mentor_id = $1 AND m.status = 'completed'
    `;

    const [totalMenteesRes, upcomingRes, completedRes] = await Promise.all([
      pool.query(totalMenteesQuery, [mentorId]),
      pool.query(upcomingMeetingsQuery, [mentorId]),
      pool.query(completedSessionsQuery, [mentorId])
    ]);

    // Pending requests not modeled yet → return 0 for now
    const pendingRequests = 0;

    res.json({
      totalMentees: Number(totalMenteesRes.rows[0].count || 0),
      upcomingMeetings: Number(upcomingRes.rows[0].count || 0),
      pendingRequests,
      completedSessions: Number(completedRes.rows[0].count || 0),
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
