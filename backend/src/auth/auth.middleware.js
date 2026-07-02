const { AUTH_ERROR_CODES } = require('./auth.errors');
const { resolveProvisionedUser } = require('./auth.service');

async function authenticateRequest(req, res, next) {
  try {
    const result = await resolveProvisionedUser(req);
    if (result.status !== 200) {
      return res.status(result.status).json({
        code: result.code,
        message: result.message,
      });
    }

    req.user = result.user;
    req.authSource = 'clerk';
    return next();
  } catch (err) {
    console.error('[auth] Authentication failed:', err?.message || err);
    return res.status(401).json({
      code: AUTH_ERROR_CODES.AUTHENTICATION_FAILED,
      message: 'Authentication failed',
    });
  }
}

module.exports = authenticateRequest;
module.exports.resolveProvisionedUser = resolveProvisionedUser;
