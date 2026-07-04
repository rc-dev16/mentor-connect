const pool = require('../config/database');
const { AUTH_ERROR_CODES, authError } = require('./auth.errors');
const {
  getClerkAuthUserId,
  getClerkUser,
  getPrimaryEmail,
  clerkUserHasPassword,
  updateClerkPassword,
} = require('./clerk.service');

function toSessionUser(dbUser, clerkUserId) {
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.name,
    user_type: dbUser.user_type,
    registration_number: dbUser.registration_number,
    department: dbUser.department,
    phone: dbUser.phone,
    bio: dbUser.bio,
    clerk_user_id: clerkUserId,
    password_setup_completed: Boolean(dbUser.password_setup_completed),
  };
}

async function resolveProvisionedUser(req, { touchLastLogin = false } = {}) {
  const clerkUserId = getClerkAuthUserId(req);
  if (!clerkUserId) {
    return authError(401, AUTH_ERROR_CODES.UNAUTHENTICATED, 'Authentication required');
  }

  const clerkUser = await getClerkUser(clerkUserId);
  const email = getPrimaryEmail(clerkUser);
  if (!email) {
    return authError(403, AUTH_ERROR_CODES.EMAIL_MISSING, 'Your Clerk account does not have an email address.');
  }

  const byClerk = await pool.query(
    'SELECT * FROM users WHERE clerk_user_id = $1',
    [clerkUserId]
  );

  let dbUser = byClerk.rows[0];
  if (dbUser && !dbUser.is_active) {
    return authError(403, AUTH_ERROR_CODES.USER_INACTIVE, 'This Mentor-Connect account is inactive.');
  }

  if (!dbUser) {
    const byEmail = await pool.query(
      'SELECT * FROM users WHERE LOWER(email) = LOWER($1)',
      [email]
    );
    dbUser = byEmail.rows[0];
  }

  if (!dbUser) {
    return authError(403, AUTH_ERROR_CODES.USER_NOT_PROVISIONED, 'This email is not provisioned in Mentor-Connect.');
  }

  if (!dbUser.is_active) {
    return authError(403, AUTH_ERROR_CODES.USER_INACTIVE, 'This Mentor-Connect account is inactive.');
  }

  if (dbUser.clerk_user_id && dbUser.clerk_user_id !== clerkUserId) {
    return authError(403, AUTH_ERROR_CODES.ACCOUNT_LINK_CONFLICT, 'This email is already linked to a different Clerk account.');
  }

  if (!['mentor', 'mentee'].includes(dbUser.user_type)) {
    return authError(403, AUTH_ERROR_CODES.INVALID_ROLE, 'This Mentor-Connect account has an invalid role.');
  }

  if (!dbUser.clerk_user_id || touchLastLogin) {
    const updateResult = await pool.query(
      `UPDATE users
       SET clerk_user_id = COALESCE(clerk_user_id, $1),
           last_login_at = CASE WHEN $2 THEN CURRENT_TIMESTAMP ELSE last_login_at END
       WHERE id = $3
       RETURNING *`,
      [clerkUserId, touchLastLogin, dbUser.id]
    );
    dbUser = updateResult.rows[0];
  }

  return {
    status: 200,
    user: {
      userId: dbUser.id,
      email: dbUser.email,
      userType: dbUser.user_type,
      clerkUserId,
    },
    session: {
      user: toSessionUser(dbUser, clerkUserId),
      role: dbUser.user_type,
      requiresPasswordSetup:
        !dbUser.password_setup_completed || !clerkUserHasPassword(clerkUser),
    },
  };
}

async function completePasswordSetup(user, password) {
  await updateClerkPassword(user.clerkUserId, password);

  const result = await pool.query(
    `UPDATE users
     SET password_setup_completed = true,
         updated_at = CURRENT_TIMESTAMP
     WHERE id = $1
     RETURNING id, email, name, user_type, registration_number, department, phone, bio, password_setup_completed`,
    [user.userId]
  );

  return result.rows[0];
}

async function getActiveUserById(userId) {
  const userQuery = 'SELECT id, email, name, user_type, registration_number, department, phone, bio, created_at, password_setup_completed FROM users WHERE id = $1 AND is_active = true';
  const userResult = await pool.query(userQuery, [userId]);
  return userResult.rows[0] || null;
}

module.exports = {
  resolveProvisionedUser,
  completePasswordSetup,
  getActiveUserById,
};
