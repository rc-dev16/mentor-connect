const express = require('express');
const authenticateRequest = require('../../auth/auth.middleware');
const notificationsService = require('./notifications.service');

const router = express.Router();

router.use(authenticateRequest);

// Get all notifications for the current user
router.get('/', async (req, res) => {
  try {
    const notifications = await notificationsService.getNotifications(req.user.userId);
    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get unread notifications count
router.get('/unread-count', async (req, res) => {
  try {
    const result = await notificationsService.getUnreadCount(req.user.userId);
    res.json(result);
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await notificationsService.markAsRead(req.params.id, req.user.userId);

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json(notification);
  } catch (error) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Mark all notifications as read
router.put('/read-all', async (req, res) => {
  try {
    const result = await notificationsService.markAllAsRead(req.user.userId);
    res.json(result);
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
