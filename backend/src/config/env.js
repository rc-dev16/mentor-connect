function parseCsvEnv(value) {
  return (value || '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function getFrontendOrigins() {
  return parseCsvEnv(process.env.FRONTEND_URL || process.env.FRONTEND_ORIGIN);
}

function getCorsOrigins() {
  const localhostOrigins = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:8081',
    'http://127.0.0.1:8081',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];

  return [...new Set([
    ...localhostOrigins,
    ...getFrontendOrigins(),
    ...parseCsvEnv(process.env.CORS_ORIGIN),
  ])];
}

function getClerkAuthorizedParties() {
  const localhostOrigins = [
    'http://localhost:8080',
    'http://127.0.0.1:8080',
    'http://localhost:8081',
    'http://127.0.0.1:8081',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ];

  return [...new Set([
    ...localhostOrigins,
    ...getFrontendOrigins(),
    ...parseCsvEnv(process.env.CLERK_AUTHORIZED_PARTIES),
  ])];
}

function getClerkKeys() {
  return {
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY || process.env.VITE_CLERK_PUBLISHABLE_KEY,
    secretKey: process.env.CLERK_SECRET_KEY,
  };
}

function validateClerkConfig() {
  const { publishableKey, secretKey } = getClerkKeys();
  const missing = [];

  if (!publishableKey) missing.push('CLERK_PUBLISHABLE_KEY');
  if (!secretKey) missing.push('CLERK_SECRET_KEY');

  return {
    publishableKey,
    secretKey,
    isConfigured: missing.length === 0,
    missing,
  };
}

module.exports = {
  parseCsvEnv,
  getFrontendOrigins,
  getCorsOrigins,
  getClerkAuthorizedParties,
  getClerkKeys,
  validateClerkConfig,
};
