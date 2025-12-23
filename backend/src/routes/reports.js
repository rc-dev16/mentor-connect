const express = require('express');
const pool = require('../config/database');
const authenticateRequest = require('../middleware/authenticate');

const router = express.Router();

router.use(authenticateRequest);

// Get reports for a mentor
router.get('/', async (req, res) => {
  try {
    if (req.user.userType !== 'mentor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const query = `
      SELECT * FROM reports 
      WHERE mentor_id = $1 
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [req.user.userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
