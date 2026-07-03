const express = require('express');
const authenticateRequest = require('../../auth/auth.middleware');
const reportsService = require('./reports.service');

const router = express.Router();

router.use(authenticateRequest);

// Get reports for a mentor
router.get('/', async (req, res) => {
  try {
    const result = await reportsService.getReports(req.user.userId, req.user.userType);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
