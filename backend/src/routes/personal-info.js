const express = require('express');
const { body, validationResult } = require('express-validator');
const PDFDocument = require('pdfkit');
const pool = require('../config/database');
const authenticateRequest = require('../middleware/authenticate');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateRequest);

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

// Download all mentees' personal info as CSV (for mentors)
router.get('/mentees/export', async (req, res) => {
  try {
    if (req.user.userType !== 'mentor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Get all mentees with their personal information for this mentor
    const query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.registration_number,
        u.department,
        u.phone,
        pi.section,
        pi.roll_no,
        pi.branch,
        pi.blood_group,
        pi.hostel_block,
        pi.room_no,
        pi.date_of_birth,
        pi.has_muj_alumni,
        pi.alumni_details,
        pi.father_name,
        pi.father_mobile,
        pi.father_email,
        pi.father_occupation,
        pi.father_organization,
        pi.father_designation,
        pi.mother_name,
        pi.mother_mobile,
        pi.mother_email,
        pi.mother_occupation,
        pi.mother_organization,
        pi.mother_designation,
        pi.communication_address,
        pi.communication_pincode,
        pi.permanent_address,
        pi.permanent_pincode,
        pi.business_card_url
      FROM users u
      JOIN mentorship_relationships mr ON u.id = mr.mentee_id
      LEFT JOIN personal_information pi ON u.id = pi.user_id
      WHERE mr.mentor_id = $1 AND u.is_active = true AND mr.status = 'active'
      ORDER BY u.name
    `;

    const result = await pool.query(query, [req.user.userId]);
    const mentees = result.rows;

    // CSV Headers
    const headers = [
      'ID',
      'Name',
      'Email',
      'Registration Number',
      'Department',
      'Phone',
      'Section',
      'Roll No',
      'Branch',
      'Blood Group',
      'Hostel Block',
      'Room No',
      'Date of Birth',
      'Has MUJ Alumni',
      'Alumni Details',
      'Father Name',
      'Father Mobile',
      'Father Email',
      'Father Occupation',
      'Father Organization',
      'Father Designation',
      'Mother Name',
      'Mother Mobile',
      'Mother Email',
      'Mother Occupation',
      'Mother Organization',
      'Mother Designation',
      'Communication Address',
      'Communication Pincode',
      'Permanent Address',
      'Permanent Pincode',
      'Business Card URL'
    ];

    // Escape CSV values (handle commas, quotes, and newlines)
    function escapeCSV(value) {
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      // If contains comma, quote, or newline, wrap in quotes and escape quotes
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }

    // Build CSV content
    let csvContent = headers.join(',') + '\n';

    mentees.forEach(mentee => {
      const row = [
        escapeCSV(mentee.id),
        escapeCSV(mentee.name),
        escapeCSV(mentee.email),
        escapeCSV(mentee.registration_number),
        escapeCSV(mentee.department),
        escapeCSV(mentee.phone),
        escapeCSV(mentee.section),
        escapeCSV(mentee.roll_no),
        escapeCSV(mentee.branch),
        escapeCSV(mentee.blood_group),
        escapeCSV(mentee.hostel_block),
        escapeCSV(mentee.room_no),
        escapeCSV(mentee.date_of_birth),
        escapeCSV(mentee.has_muj_alumni ? 'Yes' : 'No'),
        escapeCSV(mentee.alumni_details),
        escapeCSV(mentee.father_name),
        escapeCSV(mentee.father_mobile),
        escapeCSV(mentee.father_email),
        escapeCSV(mentee.father_occupation),
        escapeCSV(mentee.father_organization),
        escapeCSV(mentee.father_designation),
        escapeCSV(mentee.mother_name),
        escapeCSV(mentee.mother_mobile),
        escapeCSV(mentee.mother_email),
        escapeCSV(mentee.mother_occupation),
        escapeCSV(mentee.mother_organization),
        escapeCSV(mentee.mother_designation),
        escapeCSV(mentee.communication_address),
        escapeCSV(mentee.communication_pincode),
        escapeCSV(mentee.permanent_address),
        escapeCSV(mentee.permanent_pincode),
        escapeCSV(mentee.business_card_url)
      ];
      csvContent += row.join(',') + '\n';
    });

    // Set headers for CSV download
    const filename = `mentees_personal_info_${new Date().toISOString().split('T')[0]}.csv`;
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);

  } catch (error) {
    console.error('Export mentees personal info error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Download mentee personal information as PDF (for mentors)
router.get('/mentee/:menteeId/pdf', async (req, res) => {
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

    const mentee = userResult.rows[0];
    const personalInfo = personalInfoResult.rows[0];

    // Check if mentor has access to this mentee
    const relationshipQuery = `
      SELECT id FROM mentorship_relationships 
      WHERE mentor_id = $1 AND mentee_id = $2 AND status = 'active'
    `;
    const relationshipResult = await pool.query(relationshipQuery, [req.user.userId, menteeId]);

    if (relationshipResult.rows.length === 0) {
      return res.status(403).json({ message: 'Access denied. This mentee is not assigned to you.' });
    }

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });
    const filename = `mentee_personal_info_${mentee.registration_number}_${new Date().toISOString().split('T')[0]}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    doc.pipe(res);

    // Helper function to add section
    const addSection = (title, data, startY) => {
      // Check if we need a new page
      if (startY > doc.page.height - 150) {
        doc.addPage();
        startY = 50;
      }

      doc.fontSize(14).font('Helvetica-Bold').text(title, 50, startY, { underline: true });
      let y = startY + 25;
      
      Object.entries(data).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          // Check for page break
          if (y > doc.page.height - 80) {
            doc.addPage();
            y = 50;
          }

          const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
          
          doc.fontSize(10)
             .font('Helvetica-Bold')
             .text(`${label}:`, 60, y);
          doc.font('Helvetica')
             .text(displayValue, 200, y, { width: 300 });
          y += 20;
        }
      });
      
      return y + 10;
    };

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('MENTEE PERSONAL INFORMATION', 50, 50, { align: 'center' });
    doc.fontSize(12).font('Helvetica').text(`Generated on: ${new Date().toLocaleDateString()}`, 50, 80, { align: 'center' });
    
    let y = 120;

    // Basic Information
    doc.fontSize(16).font('Helvetica-Bold').text('BASIC INFORMATION', 50, y, { underline: true });
    y += 25;
    
    const basicInfo = {
      'Name': mentee.name,
      'Registration Number': mentee.registration_number,
      'Email': mentee.email,
      'Phone': mentee.phone || 'Not provided',
      'Department': mentee.department
    };

    Object.entries(basicInfo).forEach(([key, value]) => {
      doc.fontSize(10)
         .font('Helvetica-Bold')
         .text(`${key}:`, 60, y);
      doc.font('Helvetica')
         .text(value || 'Not provided', 200, y, { width: 300 });
      y += 20;
    });

    y += 10;

    // Personal Information (if available)
    if (personalInfo) {
      // Academic Information
      y = addSection('ACADEMIC INFORMATION', {
        'Section': personalInfo.section,
        'Roll Number': personalInfo.roll_no,
        'Branch': personalInfo.branch,
        'Blood Group': personalInfo.blood_group,
        'Date of Birth': personalInfo.date_of_birth ? new Date(personalInfo.date_of_birth).toLocaleDateString() : null,
        'Hostel Block': personalInfo.hostel_block,
        'Room Number': personalInfo.room_no
      }, y);

      // MUJ Alumni Information
      if (personalInfo.has_muj_alumni) {
        if (y > doc.page.height - 100) {
          doc.addPage();
          y = 50;
        }
        doc.fontSize(14).font('Helvetica-Bold').text('MUJ ALUMNI INFORMATION', 50, y, { underline: true });
        y += 25;
        doc.fontSize(10)
           .font('Helvetica-Bold')
           .text('Alumni Details:', 60, y);
        doc.font('Helvetica')
           .text(personalInfo.alumni_details || 'Not provided', 200, y, { width: 300 });
        y += 40;
      }

      // Father's Information
      y = addSection('FATHER\'S INFORMATION', {
        'Name': personalInfo.father_name,
        'Mobile': personalInfo.father_mobile,
        'Email': personalInfo.father_email,
        'Occupation': personalInfo.father_occupation,
        'Organization': personalInfo.father_organization,
        'Designation': personalInfo.father_designation
      }, y);

      // Mother's Information
      y = addSection('MOTHER\'S INFORMATION', {
        'Name': personalInfo.mother_name,
        'Mobile': personalInfo.mother_mobile,
        'Email': personalInfo.mother_email,
        'Occupation': personalInfo.mother_occupation,
        'Organization': personalInfo.mother_organization,
        'Designation': personalInfo.mother_designation
      }, y);

      // Address Information
      if (y > doc.page.height - 150) {
        doc.addPage();
        y = 50;
      }
      doc.fontSize(14).font('Helvetica-Bold').text('ADDRESS INFORMATION', 50, y, { underline: true });
      y += 25;
      
      doc.fontSize(12).font('Helvetica-Bold').text('Communication Address:', 60, y);
      y += 20;
      if (y > doc.page.height - 120) {
        doc.addPage();
        y = 50;
        doc.fontSize(12).font('Helvetica-Bold').text('Communication Address:', 60, y);
        y += 20;
      }
      doc.fontSize(10).font('Helvetica').text(personalInfo.communication_address || 'Not provided', 60, y, { width: 450 });
      // Estimate height: approximately 15px per line, with ~60 chars per line
      const commAddrLines = Math.max(1, Math.ceil((personalInfo.communication_address || 'Not provided').length / 60));
      y += (commAddrLines * 15) + 10;
      
      if (y > doc.page.height - 50) {
        doc.addPage();
        y = 50;
      }
      doc.fontSize(10).font('Helvetica-Bold').text('Pin Code:', 60, y);
      doc.font('Helvetica').text(personalInfo.communication_pincode || 'Not provided', 200, y);
      y += 30;

      if (y > doc.page.height - 120) {
        doc.addPage();
        y = 50;
      }
      doc.fontSize(12).font('Helvetica-Bold').text('Permanent Address:', 60, y);
      y += 20;
      if (y > doc.page.height - 120) {
        doc.addPage();
        y = 50;
        doc.fontSize(12).font('Helvetica-Bold').text('Permanent Address:', 60, y);
        y += 20;
      }
      doc.fontSize(10).font('Helvetica').text(personalInfo.permanent_address || 'Not provided', 60, y, { width: 450 });
      const permAddrLines = Math.max(1, Math.ceil((personalInfo.permanent_address || 'Not provided').length / 60));
      y += (permAddrLines * 15) + 10;
      
      if (y > doc.page.height - 50) {
        doc.addPage();
        y = 50;
      }
      doc.fontSize(10).font('Helvetica-Bold').text('Pin Code:', 60, y);
      doc.font('Helvetica').text(personalInfo.permanent_pincode || 'Not provided', 200, y);
      y += 30;
    } else {
      doc.fontSize(12).font('Helvetica').text('No personal information available for this mentee.', 60, y);
    }

    // Footer
    const pageHeight = doc.page.height;
    doc.fontSize(8)
       .font('Helvetica')
       .text(`This document was generated on ${new Date().toLocaleString()}`, 50, pageHeight - 50, { align: 'center' });

    doc.end();

  } catch (error) {
    console.error('Export mentee PDF error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

module.exports = router;
