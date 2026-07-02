const express = require('express');
const authenticateRequest = require('./auth.middleware');
const { AUTH_ERROR_CODES } = require('./auth.errors');
const {
  completePasswordSetup,
  getActiveUserById,
  resolveProvisionedUser,
} = require('./auth.service');

const router = express.Router();

function sessionError(res, result) {
  return res.status(result.status).json({
    code: result.code,
    message: result.message,
  });
}

// Clerk-backed app session. Clerk proves identity; the DB grants app access.
router.get('/session', async (req, res) => {
  try {
    const result = await resolveProvisionedUser(req, { touchLastLogin: true });
    if (result.status !== 200) return sessionError(res, result);
    return res.json(result.session);
  } catch (error) {
    console.error('Session error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/password-setup-complete', authenticateRequest, async (req, res) => {
  try {
    const { password } = req.body || {};
    if (!password || typeof password !== 'string' || password.length < 8) {
      return res.status(400).json({
        code: AUTH_ERROR_CODES.INVALID_PASSWORD,
        message: 'Password must be at least 8 characters.',
      });
    }

    const user = await completePasswordSetup(req.user, password);

    return res.json({
      message: 'Password setup marked complete',
      user,
    });
  } catch (error) {
    console.error('Password setup completion error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

// Passwords are handled by Clerk. App-level registration is disabled.
router.post('/login', (req, res) => {
  res.status(410).json({
    code: AUTH_ERROR_CODES.CLERK_AUTH_REQUIRED,
    message: 'Password login is handled by Clerk. Use the app sign-in flow.',
  });
});

router.post('/register', (req, res) => {
  res.status(403).json({
    code: AUTH_ERROR_CODES.REGISTRATION_DISABLED,
    message: 'Mentor-Connect access is limited to provisioned CSV users.',
  });
});

// Verify token endpoint (Clerk session only)
router.get('/verify', authenticateRequest, async (req, res) => {
  try {
    const user = await getActiveUserById(req.user.userId);

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
