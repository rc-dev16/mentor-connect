const express = require('express');
const { body, validationResult } = require('express-validator');
const authenticateRequest = require('../../auth/auth.middleware');
const {
  getSessionRequests,
  createSessionRequest,
  updateStatus,
  cancelRequest,
} = require('./session-requests.service');

const router = express.Router();

router.use(authenticateRequest);

// Get session requests for a mentor
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    const result = await getSessionRequests(req.user, status);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Get session requests error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new session request (mentee)
router.post('/', [
  body('title').notEmpty(),
  body('description').notEmpty(),
  body('preferred_date').isISO8601(),
  body('preferred_time').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('duration_minutes').optional().isInt({ min: 15, max: 480 }),
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
    const result = await createSessionRequest(req.user, {
      title,
      description,
      preferred_date,
      preferred_time,
      duration_minutes,
    });

    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Create session request error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Update session request status (mentor approves/rejects)
router.put('/:id/status', [
  body('status').isIn(['pending', 'approved', 'rejected']),
  body('mentor_notes').optional().isString(),
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
    const result = await updateStatus(req.user, requestId, { status, mentor_notes });

    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Update session request status error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Cancel a pending session request (mentee)
router.delete('/:id', async (req, res) => {
  try {
    if (req.user.userType !== 'mentee') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const requestId = req.params.id;
    const result = await cancelRequest(req.user, requestId);

    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Cancel session request error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
