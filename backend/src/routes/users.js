const express = require('express');
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

// Helper function to check if columns exist
async function checkColumnExists(tableName, columnName) {
  try {
    const query = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = $1 AND column_name = $2
    `;
    const result = await pool.query(query, [tableName, columnName]);
    return result.rows.length > 0;
  } catch (error) {
    console.error(`Error checking column ${columnName}:`, error);
    return false;
  }
}

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    // Check if new columns exist
    const hasCabin = await checkColumnExists('users', 'cabin');
    const hasAvailability = await checkColumnExists('users', 'availability');

    // Build query based on existing columns
    let columns = 'id, email, name, user_type, registration_number, department, phone, bio, created_at';
    if (hasCabin) columns += ', cabin';
    if (hasAvailability) columns += ', availability';

    const query = `SELECT ${columns} FROM users WHERE id = $1`;
    const result = await pool.query(query, [req.user.userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure cabin and availability are always in response (null if columns don't exist)
    const profile = result.rows[0];
    if (!hasCabin) profile.cabin = null;
    if (!hasAvailability) profile.availability = null;

    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { phone, cabin, availability, bio } = req.body;
    const userId = req.user.userId;

    // Check if new columns exist
    const hasCabin = await checkColumnExists('users', 'cabin');
    const hasAvailability = await checkColumnExists('users', 'availability');

    // Build update query dynamically based on provided fields
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (phone !== undefined) {
      updates.push(`phone = $${paramCount++}`);
      values.push(phone);
    }
    if (cabin !== undefined && hasCabin) {
      updates.push(`cabin = $${paramCount++}`);
      values.push(cabin);
    } else if (cabin !== undefined && !hasCabin) {
      // Column doesn't exist, but user tried to update it
      // We could add the column here, but it's better to return an error or ignore
      console.warn('cabin column does not exist, skipping update');
    }
    if (availability !== undefined && hasAvailability) {
      updates.push(`availability = $${paramCount++}`);
      values.push(availability);
    } else if (availability !== undefined && !hasAvailability) {
      console.warn('availability column does not exist, skipping update');
    }
    if (bio !== undefined) {
      updates.push(`bio = $${paramCount++}`);
      values.push(bio);
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: 'No fields to update or columns do not exist. Please run the migration script to add cabin and availability columns.' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(userId);

    // Build RETURNING clause based on existing columns
    let returningColumns = 'id, email, name, user_type, registration_number, department, phone, bio, created_at, updated_at';
    if (hasCabin) returningColumns += ', cabin';
    if (hasAvailability) returningColumns += ', availability';

    const query = `
      UPDATE users 
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING ${returningColumns}
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Ensure cabin and availability are always in response
    const profile = result.rows[0];
    if (!hasCabin) profile.cabin = null;
    if (!hasAvailability) profile.availability = null;

    res.json(profile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Get active mentor for the logged-in mentee
router.get('/my-mentor', async (req, res) => {
  try {
    if (req.user.userType !== 'mentee') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Check if new columns exist
    const hasCabin = await checkColumnExists('users', 'cabin');
    const hasAvailability = await checkColumnExists('users', 'availability');

    // Build query based on existing columns
    let columns = 'u.id, u.name, u.email, u.phone';
    if (hasCabin) columns += ', u.cabin';
    if (hasAvailability) columns += ', u.availability';

    const query = `
      SELECT ${columns}
      FROM mentorship_relationships mr
      JOIN users u ON u.id = mr.mentor_id
      WHERE mr.mentee_id = $1 AND mr.status = 'active'
      ORDER BY mr.start_date DESC
      LIMIT 1
    `;
    const result = await pool.query(query, [req.user.userId]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No active mentor found' });
    }
    
    // Ensure cabin and availability are always in response
    const mentor = result.rows[0];
    if (!hasCabin) mentor.cabin = null;
    if (!hasAvailability) mentor.availability = null;
    
    res.json(mentor);
  } catch (error) {
    console.error('Get my mentor error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get mentees for a mentor
router.get('/mentees', async (req, res) => {
  try {
    if (req.user.userType !== 'mentor') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const query = `
      SELECT 
        u.id, 
        u.name, 
        u.email, 
        u.registration_number, 
        u.department, 
        u.phone, 
        u.bio,
        mr.status as mentorship_status,
        EXISTS (
          SELECT 1 FROM personal_information pi WHERE pi.user_id = u.id
        ) AS has_personal_info
      FROM users u
      JOIN mentorship_relationships mr ON u.id = mr.mentee_id
      WHERE mr.mentor_id = $1 AND u.is_active = true
      ORDER BY u.name
    `;

    const result = await pool.query(query, [req.user.userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Get mentees error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Dashboard stats for a mentor
router.get('/dashboard/stats', async (req, res) => {
  try {
    const mentorId = req.user.userId;

    // Total mentees (active relationships and active users)
    const totalMenteesQuery = `
      SELECT COUNT(*) AS count
      FROM mentorship_relationships mr
      JOIN users u ON u.id = mr.mentee_id
      WHERE mr.mentor_id = $1 AND mr.status = 'active' AND u.is_active = true
    `;

    // Upcoming meetings in the next 7 days with status scheduled
    const upcomingMeetingsQuery = `
      SELECT COUNT(*) AS count
      FROM meetings m
      WHERE m.mentor_id = $1 
        AND m.status = 'scheduled'
        AND m.meeting_date BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '7 days'
    `;

    // Sessions completed (all-time)
    const completedSessionsQuery = `
      SELECT COUNT(*) AS count
      FROM meetings m
      WHERE m.mentor_id = $1 AND m.status = 'completed'
    `;

    const [totalMenteesRes, upcomingRes, completedRes] = await Promise.all([
      pool.query(totalMenteesQuery, [mentorId]),
      pool.query(upcomingMeetingsQuery, [mentorId]),
      pool.query(completedSessionsQuery, [mentorId])
    ]);

    // Pending requests not modeled yet → return 0 for now
    const pendingRequests = 0;

    res.json({
      totalMentees: Number(totalMenteesRes.rows[0].count || 0),
      upcomingMeetings: Number(upcomingRes.rows[0].count || 0),
      pendingRequests,
      completedSessions: Number(completedRes.rows[0].count || 0),
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
