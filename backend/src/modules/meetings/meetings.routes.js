const express = require('express');
const { body, validationResult } = require('express-validator');
const authenticateRequest = require('../../auth/auth.middleware');
const meetingsService = require('./meetings.service');

const router = express.Router();

router.use(authenticateRequest);

router.get('/for-mentee', async (req, res) => {
  try {
    const result = await meetingsService.getMeetingsForMentee(
      req.user.userType,
      req.user.userId,
      req.query.status
    );
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Get mentee meetings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await meetingsService.getMeetingsForMentor(req.user.userId, req.query.status);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Get meetings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await meetingsService.getMeetingById(req.params.id, req.user.userId);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Get meeting error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', [
  body('title').notEmpty(),
  body('topic').notEmpty(),
  body('agenda').notEmpty(),
  body('meetingDate').isISO8601(),
  body('meetingTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('durationMinutes').isInt({ min: 15, max: 480 }),
  body('teamsLink').optional().isURL(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const result = await meetingsService.createMeeting(req.user.userId, req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Create meeting error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', [
  body('title').optional().notEmpty(),
  body('topic').optional().notEmpty(),
  body('agenda').optional().notEmpty(),
  body('meetingDate').optional().isISO8601(),
  body('meetingTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  body('durationMinutes').optional().isInt({ min: 15, max: 480 }),
  body('teamsLink').optional().isURL(),
  body('status').optional().isIn(['scheduled', 'completed', 'cancelled']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const result = await meetingsService.updateMeeting(req.params.id, req.user.userId, req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Update meeting error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/:id/complete', [
  body('comments').notEmpty(),
  body('actionPoints').notEmpty(),
  body('attendance').isArray(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const result = await meetingsService.completeMeeting(req.params.id, req.user.userId, req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Complete meeting error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const result = await meetingsService.deleteMeeting(req.params.id, req.user.userId);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Delete meeting error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/mentees/list', async (req, res) => {
  try {
    const result = await meetingsService.getMenteesList(req.user.userId);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Get mentees error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id/download', async (req, res) => {
  try {
    const result = await meetingsService.downloadMeetingPdf(req.params.id, req.user.userId, res);
    if (result.streamed) {
      return;
    }
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Download meeting PDF error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

module.exports = router;
