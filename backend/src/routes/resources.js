const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/database');

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

router.use(authenticateToken);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/resources');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: timestamp-originalname
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter for PDF and Word documents
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and Word documents (.pdf, .doc, .docx) are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Get all resources
router.get('/', async (req, res) => {
  try {
    // Check if user is a mentor or mentee
    const userQuery = `SELECT user_type FROM users WHERE id = $1`;
    const userResult = await pool.query(userQuery, [req.user.userId]);
    const userType = userResult.rows[0]?.user_type;

    let query;
    let params;

    if (userType === 'mentor') {
      // Mentors see: only resources they uploaded
      query = `
        SELECT r.*, u.name as uploaded_by_name
        FROM resources r
        JOIN users u ON r.uploaded_by = u.id
        WHERE r.uploaded_by = $1
        ORDER BY r.created_at DESC
      `;
      params = [req.user.userId];
    } else {
      // Mentees see: ONLY resources from their assigned mentor
      // First get the mentor_id for this mentee
      const mentorQuery = `
        SELECT mentor_id 
        FROM mentorship_relationships 
        WHERE mentee_id = $1 AND status = 'active'
        LIMIT 1
      `;
      const mentorResult = await pool.query(mentorQuery, [req.user.userId]);
      const mentorId = mentorResult.rows.length > 0 ? mentorResult.rows[0].mentor_id : null;

      if (mentorId) {
        // Mentee has a mentor - show ONLY resources from their assigned mentor
        query = `
          SELECT r.*, u.name as uploaded_by_name
          FROM resources r
          JOIN users u ON r.uploaded_by = u.id
          WHERE r.uploaded_by = $1
          ORDER BY r.created_at DESC
        `;
        params = [mentorId];
      } else {
        // Mentee has no mentor - show no resources
        query = `
          SELECT r.*, u.name as uploaded_by_name
          FROM resources r
          JOIN users u ON r.uploaded_by = u.id
          WHERE 1 = 0
          ORDER BY r.created_at DESC
        `;
        params = [];
      }
    }

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new resource (with file upload support)
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { title, description, resource_type, is_public } = req.body;
    const file = req.file;

    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    // Determine resource type
    let finalResourceType = resource_type || 'link';
    let fileUrl = null;
    let fileSize = null;
    let mimeType = null;

    if (file) {
      // File upload
      finalResourceType = 'file';
      fileUrl = `/api/resources/files/${file.filename}`;
      fileSize = file.size;
      mimeType = file.mimetype;
    } else if (req.body.url) {
      // Link resource
      finalResourceType = 'link';
      fileUrl = req.body.url;
    } else {
      return res.status(400).json({ message: 'Either a file or URL is required' });
    }

    // Insert resource into database
    const insertQuery = `
      INSERT INTO resources (
        title, description, resource_type, file_url, file_size, mime_type,
        uploaded_by, is_public
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const result = await pool.query(insertQuery, [
      title,
      description || null,
      finalResourceType,
      fileUrl,
      fileSize,
      mimeType,
      req.user.userId,
      is_public === 'true' || is_public === true
    ]);

    const newResource = result.rows[0];

    // Create notifications for all mentees when mentor adds a resource
    try {
      // Get all mentees assigned to this mentor
      const menteesQuery = `
        SELECT mentee_id 
        FROM mentorship_relationships 
        WHERE mentor_id = $1 AND status = 'active'
      `;
      const menteesResult = await pool.query(menteesQuery, [req.user.userId]);

      // Create notification for each mentee
      if (menteesResult.rows.length > 0) {
        const resourceTypeText = finalResourceType === 'file' ? 'a file' : 'a link';
        const notificationTitle = 'New Resource Available';
        const notificationMessage = `Your mentor has added ${resourceTypeText}: "${title}"${description ? ` - ${description}` : ''}`;

        // Insert notifications one by one to avoid SQL injection and parameter issues
        for (const row of menteesResult.rows) {
          await pool.query(
            `INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
              row.mentee_id,
              notificationTitle,
              notificationMessage,
              'resource_added',
              'resource',
              newResource.id
            ]
          );
        }
      }
    } catch (notifError) {
      // Log error but don't fail the resource creation
      console.error('Error creating notifications:', notifError);
    }

    res.status(201).json({
      message: 'Resource created successfully',
      resource: newResource
    });

  } catch (error) {
    console.error('Create resource error:', error);
    // Clean up uploaded file if database insert fails
    if (req.file) {
      const filePath = path.join(__dirname, '../../uploads/resources', req.file.filename);
      fs.unlink(filePath, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Serve uploaded files
router.get('/files/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../../uploads/resources', filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Set appropriate headers
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    
    // Determine content type
    const ext = path.extname(filename).toLowerCase();
    const contentTypes = {
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    
    if (contentTypes[ext]) {
      res.setHeader('Content-Type', contentTypes[ext]);
    }

    // Send file
    res.sendFile(path.resolve(filePath));
  } catch (error) {
    console.error('Serve file error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
