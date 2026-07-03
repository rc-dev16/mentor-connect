const express = require('express');
const authenticateRequest = require('../../auth/auth.middleware');
const dashboardService = require('./dashboard.service');

const router = express.Router();

router.use(authenticateRequest);

router.get('/summary', async (req, res) => {
  try {
    const result = await dashboardService.getSummary(req.user);
    if (result.status === 403) {
      return res.status(403).json(result.body);
    }
    return res.json(result);
  } catch (error) {
    console.error('Dashboard summary error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
