const jwt = require('jsonwebtoken');
const { verifyToken, users } = require('@clerk/clerk-sdk-node');
const pool = require('../config/database');

/**
 * Verify a Clerk-issued session/JWT.
 */
async function verifyClerkSession(token) {
  if (!process.env.CLERK_SECRET_KEY) return null;

  try {
    const claims = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
      clockSkewInMs: 5000,
      audience: process.env.CLERK_JWT_AUD || undefined,
      authorizedParties: process.env.CLERK_AUTHORIZED_PARTIES
        ? process.env.CLERK_AUTHORIZED_PARTIES.split(',').map((p) => p.trim()).filter(Boolean)
        : undefined,
    });
    return claims;
  } catch (err) {
    console.warn('[auth] Clerk verification failed:', err?.message || err);
    return null;
  }
}

/**
 * Fallback: fetch Clerk user to get email if token lacks it.
 */
async function getEmailFromClerk(userId) {
  try {
    const clerkUser = await users.getUser(userId);
    const primary = clerkUser.primaryEmailAddress;
    const emails = clerkUser.emailAddresses || [];
    return (
      primary?.emailAddress ||
      emails[0]?.emailAddress ||
      null
    );
  } catch (err) {
    console.warn('[auth] Failed to fetch user from Clerk', err?.message || err);
    return null;
  }
}

/**
 * Map a Clerk user (by email) to an existing DB user.
 */
async function mapClerkUserToDbUser(email) {
  if (!email) return null;
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE LOWER(email) = LOWER($1) AND is_active = true',
    [email]
  );
  return rows[0] || null;
}

/**
 * Unified authentication middleware.
 * - First tries Clerk JWT/session verification
 * - Falls back to legacy app JWT for backward compatibility
 */
async function authenticateRequest(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    console.warn('[auth] No Authorization bearer token on', req.path);
    return res.status(401).json({ message: 'Access token required' });
  }

  try {
    // 1) Try Clerk token
    console.info('[auth] Attempting Clerk verification', {
      path: req.path,
      hasClerkSecret: !!process.env.CLERK_SECRET_KEY,
      aud: process.env.CLERK_JWT_AUD || null,
      authorizedParties: process.env.CLERK_AUTHORIZED_PARTIES || null,
    });
    const clerkClaims = await verifyClerkSession(token);
    if (clerkClaims) {
      const email =
        clerkClaims.email ||
        clerkClaims.email_address ||
        clerkClaims?.primary_email_address?.email_address ||
        clerkClaims?.email_addresses?.[0]?.email_address;
      const resolvedEmail = email || await getEmailFromClerk(clerkClaims.sub);
      console.info('[auth] Clerk token verified', {
        sub: clerkClaims.sub,
        email: resolvedEmail,
      });

      const dbUser = await mapClerkUserToDbUser(resolvedEmail);
      if (!dbUser) {
        console.warn('[auth] Clerk user not provisioned in DB', { email: resolvedEmail });
        return res.status(403).json({ message: 'User is not provisioned in the database' });
      }

      req.user = {
        userId: dbUser.id,
        email: dbUser.email,
        userType: dbUser.user_type,
        clerkUserId: clerkClaims.sub,
      };
      req.authSource = 'clerk';
      return next();
    }

    // 2) Fallback to legacy JWT
    console.info('[auth] Falling back to legacy JWT', { path: req.path });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    req.user = decoded;
    req.authSource = 'legacy-jwt';
    return next();
  } catch (err) {
    console.error('[auth] Authentication failed:', err?.message || err);
    return res.status(403).json({ message: 'Invalid token' });
  }
}

module.exports = authenticateRequest;

