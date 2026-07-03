const express = require('express');
const authenticateRequest = require('../../auth/auth.middleware');
const usersService = require('./users.service');

const router = express.Router();

router.use(authenticateRequest);

router.get('/profile', async (req, res) => {
  try {
    const result = await usersService.getProfile(req.user.userId);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

router.put('/profile', async (req, res) => {
  try {
    const result = await usersService.updateProfile(req.user.userId, req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

router.get('/my-mentor', async (req, res) => {
  try {
    const result = await usersService.getMyMentor(req.user.userId, req.user.userType);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Get my mentor error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/mentees', async (req, res) => {
  try {
    const result = await usersService.getMentees(req.user.userId, req.user.userType);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Get mentees error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
