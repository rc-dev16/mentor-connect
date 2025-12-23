const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const pool = require('../config/database');
const authenticateRequest = require('../middleware/authenticate');

const router = express.Router();

// Login endpoint (legacy) – instruct users to sign in via Clerk
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  return res.status(410).json({ message: 'Password login has been disabled. Use Clerk email OTP to sign in.' });
});

// Register endpoint (for testing purposes)
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').notEmpty(),
  body('userType').isIn(['mentor', 'mentee']),
  body('registrationNumber').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name, userType, registrationNumber, department, phone, bio } = req.body;

    // Check if user already exists
    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const insertQuery = `
      INSERT INTO users (email, password_hash, name, user_type, registration_number, department, phone, bio)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING id, email, name, user_type, registration_number, department, phone, bio, created_at
    `;

    const result = await pool.query(insertQuery, [
      email, passwordHash, name, userType, registrationNumber, department, phone, bio
    ]);

    const newUser = result.rows[0];

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email, 
        userType: newUser.user_type 
      },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: newUser
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Verify token endpoint (supports Clerk or legacy JWT)
router.get('/verify', authenticateRequest, async (req, res) => {
  try {
    const userQuery = 'SELECT id, email, name, user_type, registration_number, department, phone, bio, created_at FROM users WHERE id = $1 AND is_active = true';
    const userResult = await pool.query(userQuery, [req.user.userId]);

    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    res.json({ user: userResult.rows[0] });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;
