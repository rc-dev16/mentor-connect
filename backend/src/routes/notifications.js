const express = require('express');
const pool = require('../config/database');
const authenticateRequest = require('../middleware/authenticate');

const router = express.Router();

router.use(authenticateRequest);

// Get all notifications for the current user
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT id, title, message, type, is_read, related_entity_type, related_entity_id, created_at
      FROM notifications
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

    const result = await pool.query(query, [req.user.userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get unread notifications count
router.get('/unread-count', async (req, res) => {
  try {
    const query = `
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = $1 AND is_read = false
    `;

    const result = await pool.query(query, [req.user.userId]);
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const notificationId = req.params.id;

    const query = `
      UPDATE notifications
      SET is_read = true
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [notificationId, req.user.userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark all notifications as read
router.put('/read-all', async (req, res) => {
  try {
    const query = `
      UPDATE notifications
      SET is_read = true
      WHERE user_id = $1 AND is_read = false
      RETURNING id
    `;

    const result = await pool.query(query, [req.user.userId]);
    res.json({ message: 'All notifications marked as read', count: result.rows.length });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

