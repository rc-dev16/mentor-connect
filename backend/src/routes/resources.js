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

// Get all resources
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT r.*, u.name as uploaded_by_name
      FROM resources r
      JOIN users u ON r.uploaded_by = u.id
      WHERE r.is_public = true OR r.uploaded_by = $1
      ORDER BY r.created_at DESC
    `;

    const result = await pool.query(query, [req.user.userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
