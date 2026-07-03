const express = require('express');
const { body, validationResult } = require('express-validator');
const authenticateRequest = require('../../auth/auth.middleware');
const personalInfoService = require('./personal-info.service');

const router = express.Router();

router.use(authenticateRequest);

router.get('/', async (req, res) => {
  try {
    const result = await personalInfoService.getPersonalInfo(req.user.userId);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Get personal info error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.post('/', [
  body('section').optional().isLength({ max: 10 }),
  body('roll_no').optional().isLength({ max: 20 }),
  body('branch').optional().isLength({ max: 100 }),
  body('blood_group').optional().isLength({ max: 10 }),
  body('hostel_block').optional().isLength({ max: 20 }),
  body('room_no').optional().isLength({ max: 20 }),
  body('date_of_birth').optional().isISO8601(),
  body('has_muj_alumni').optional().isBoolean(),
  body('alumni_details').optional().isLength({ max: 1000 }),
  body('father_name').optional().isLength({ max: 255 }),
  body('father_mobile').optional().isLength({ max: 20 }),
  body('father_email').optional().isEmail(),
  body('father_occupation').optional().isLength({ max: 100 }),
  body('father_organization').optional().isLength({ max: 255 }),
  body('father_designation').optional().isLength({ max: 255 }),
  body('mother_name').optional().isLength({ max: 255 }),
  body('mother_mobile').optional().isLength({ max: 20 }),
  body('mother_email').optional().isEmail(),
  body('mother_occupation').optional().isLength({ max: 100 }),
  body('mother_organization').optional().isLength({ max: 255 }),
  body('mother_designation').optional().isLength({ max: 255 }),
  body('communication_address').optional().isLength({ max: 1000 }),
  body('communication_pincode').optional().isLength({ max: 10 }),
  body('permanent_address').optional().isLength({ max: 1000 }),
  body('permanent_pincode').optional().isLength({ max: 10 }),
  body('business_card_url').optional().isURL(),
  body('phone').optional().isLength({ max: 20 }),
  body('email').optional().isEmail(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const result = await personalInfoService.savePersonalInfo(req.user.userId, req.body);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Save personal info error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/mentee/:menteeId', async (req, res) => {
  try {
    const result = await personalInfoService.getMenteeProfile(req.user.userType, req.params.menteeId);
    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Get mentee profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/mentees/export', async (req, res) => {
  try {
    const result = await personalInfoService.exportMenteesCsv(req.user.userType, req.user.userId);

    if (result.isFile) {
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', result.contentDisposition);
      return res.status(result.status).send(result.body);
    }

    return res.status(result.status).json(result.body);
  } catch (error) {
    console.error('Export mentees personal info error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/mentee/:menteeId/pdf', async (req, res) => {
  try {
    const result = await personalInfoService.exportMenteePdf(
      req.user.userType,
      req.user.userId,
      req.params.menteeId,
      res
    );

    if (!result.isFile) {
      return res.status(result.status).json(result.body);
    }
  } catch (error) {
    console.error('Export mentee PDF error:', error);
    if (!res.headersSent) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

module.exports = router;
