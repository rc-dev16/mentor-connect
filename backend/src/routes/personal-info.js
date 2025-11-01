const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const router = express.Router();

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Get personal information for the logged-in user
router.get('/', async (req, res) => {
  try {
    const query = `
      SELECT * FROM personal_information 
      WHERE user_id = $1
    `;
    const result = await pool.query(query, [req.user.userId]);
    
    if (result.rows.length === 0) {
      return res.json({ message: 'No personal information found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get personal info error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Save or update personal information
router.post('/', [
  // Basic Information
  body('section').optional().isLength({ max: 10 }),
  body('roll_no').optional().isLength({ max: 20 }),
  body('branch').optional().isLength({ max: 100 }),
  body('blood_group').optional().isLength({ max: 10 }),
  body('hostel_block').optional().isLength({ max: 20 }),
  body('room_no').optional().isLength({ max: 20 }),
  body('date_of_birth').optional().isISO8601(),
  
  // MUJ Alumni Information
  body('has_muj_alumni').optional().isBoolean(),
  body('alumni_details').optional().isLength({ max: 1000 }),
  
  // Father's Information
  body('father_name').optional().isLength({ max: 255 }),
  body('father_mobile').optional().isLength({ max: 20 }),
  body('father_email').optional().isEmail(),
  body('father_occupation').optional().isLength({ max: 100 }),
  body('father_organization').optional().isLength({ max: 255 }),
  body('father_designation').optional().isLength({ max: 255 }),
  
  // Mother's Information
  body('mother_name').optional().isLength({ max: 255 }),
  body('mother_mobile').optional().isLength({ max: 20 }),
  body('mother_email').optional().isEmail(),
  body('mother_occupation').optional().isLength({ max: 100 }),
  body('mother_organization').optional().isLength({ max: 255 }),
  body('mother_designation').optional().isLength({ max: 255 }),
  
  // Address Information
  body('communication_address').optional().isLength({ max: 1000 }),
  body('communication_pincode').optional().isLength({ max: 10 }),
  body('permanent_address').optional().isLength({ max: 1000 }),
  body('permanent_pincode').optional().isLength({ max: 10 }),
  
  // Business Card (optional)
  body('business_card_url').optional().isURL(),
  
  // User fields that should update the users table
  body('phone').optional().isLength({ max: 20 }),
  body('email').optional().isEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      section, roll_no, branch, blood_group, hostel_block, room_no, date_of_birth,
      has_muj_alumni, alumni_details,
      father_name, father_mobile, father_email, father_occupation, father_organization, father_designation,
      mother_name, mother_mobile, mother_email, mother_occupation, mother_organization, mother_designation,
      communication_address, communication_pincode, permanent_address, permanent_pincode,
      business_card_url, phone, email
    } = req.body;

    console.log('Personal info API - Phone received:', phone);
    console.log('Personal info API - Email received:', email);

    // Check if personal info already exists
    const existingQuery = 'SELECT id FROM personal_information WHERE user_id = $1';
    const existingResult = await pool.query(existingQuery, [req.user.userId]);

    if (existingResult.rows.length > 0) {
      // Update existing record
      const updateQuery = `
        UPDATE personal_information SET
          section = $2, roll_no = $3, branch = $4, blood_group = $5, hostel_block = $6, room_no = $7, date_of_birth = $8,
          has_muj_alumni = $9, alumni_details = $10,
          father_name = $11, father_mobile = $12, father_email = $13, father_occupation = $14, father_organization = $15, father_designation = $16,
          mother_name = $17, mother_mobile = $18, mother_email = $19, mother_occupation = $20, mother_organization = $21, mother_designation = $22,
          communication_address = $23, communication_pincode = $24, permanent_address = $25, permanent_pincode = $26,
          business_card_url = $27, updated_at = CURRENT_TIMESTAMP
        WHERE user_id = $1
        RETURNING *
      `;

      const result = await pool.query(updateQuery, [
        req.user.userId, section, roll_no, branch, blood_group, hostel_block, room_no, date_of_birth,
        has_muj_alumni, alumni_details,
        father_name, father_mobile, father_email, father_occupation, father_organization, father_designation,
        mother_name, mother_mobile, mother_email, mother_occupation, mother_organization, mother_designation,
        communication_address, communication_pincode, permanent_address, permanent_pincode,
        business_card_url
      ]);

      // Update users table if phone or email is provided
      if (phone !== undefined || email !== undefined) {
        console.log('Updating users table with phone:', phone, 'email:', email);
        const updateUsersQuery = 'UPDATE users SET phone = $1, email = $2 WHERE id = $3';
        const updateResult = await pool.query(updateUsersQuery, [phone || null, email || null, req.user.userId]);
        console.log('Users table update result:', updateResult.rows);
      }

      res.json({
        message: 'Personal information updated successfully',
        data: result.rows[0]
      });
    } else {
      // Insert new record
      const insertQuery = `
        INSERT INTO personal_information (
          user_id, section, roll_no, branch, blood_group, hostel_block, room_no, date_of_birth,
          has_muj_alumni, alumni_details,
          father_name, father_mobile, father_email, father_occupation, father_organization, father_designation,
          mother_name, mother_mobile, mother_email, mother_occupation, mother_organization, mother_designation,
          communication_address, communication_pincode, permanent_address, permanent_pincode,
          business_card_url
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27
        ) RETURNING *
      `;

      const result = await pool.query(insertQuery, [
        req.user.userId, section, roll_no, branch, blood_group, hostel_block, room_no, date_of_birth,
        has_muj_alumni, alumni_details,
        father_name, father_mobile, father_email, father_occupation, father_organization, father_designation,
        mother_name, mother_mobile, mother_email, mother_occupation, mother_organization, mother_designation,
        communication_address, communication_pincode, permanent_address, permanent_pincode,
        business_card_url
      ]);

      // Update users table if phone or email is provided
      if (phone !== undefined || email !== undefined) {
        console.log('Insert case - Updating users table with phone:', phone, 'email:', email);
        const updateUsersQuery = 'UPDATE users SET phone = $1, email = $2 WHERE id = $3';
        const updateResult = await pool.query(updateUsersQuery, [phone || null, email || null, req.user.userId]);
        console.log('Insert case - Users table update result:', updateResult.rows);
      }

      res.status(201).json({
        message: 'Personal information saved successfully',
        data: result.rows[0]
      });
    }
  } catch (error) {
    console.error('Save personal info error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get mentee profile with personal info (for mentors)
router.get('/mentee/:menteeId', async (req, res) => {
  try {
    if (req.user.userType !== 'mentor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { menteeId } = req.params;

    // Get mentee basic info
    const userQuery = `
      SELECT id, name, email, registration_number, department, phone, bio, profile_image_url, created_at
      FROM users WHERE id = $1 AND user_type = 'mentee'
    `;
    const userResult = await pool.query(userQuery, [menteeId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'Mentee not found' });
    }

    // Get personal information
    const personalInfoQuery = `
      SELECT * FROM personal_information WHERE user_id = $1
    `;
    const personalInfoResult = await pool.query(personalInfoQuery, [menteeId]);

    const menteeProfile = {
      ...userResult.rows[0],
      personal_info: personalInfoResult.rows[0] || null
    };

    res.json(menteeProfile);
  } catch (error) {
    console.error('Get mentee profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
