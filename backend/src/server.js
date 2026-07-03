const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { clerkMiddleware } = require('@clerk/express');
const fs = require('fs');
const path = require('path');

if (fs.existsSync(path.join(__dirname, '../config.env'))) {
  require('dotenv').config({ path: path.join(__dirname, '../config.env') });
} else {
  require('dotenv').config();
}

const {
  getCorsOrigins,
  getClerkAuthorizedParties,
  validateClerkConfig,
} = require('./config/env');

const authRoutes = require('./auth/auth.routes');
const userRoutes = require('./modules/users/users.routes');
const meetingRoutes = require('./modules/meetings/meetings.routes');
const resourceRoutes = require('./modules/resources/resources.routes');
const reportRoutes = require('./modules/reports/reports.routes');
const sessionRequestRoutes = require('./modules/session-requests/session-requests.routes');
const personalInfoRoutes = require('./modules/personal-info/personal-info.routes');
const notificationRoutes = require('./modules/notifications/notifications.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');

const app = express();
const PORT = process.env.PORT || 5000;
const clerkConfig = validateClerkConfig();
const allowedOrigins = getCorsOrigins();
const clerkAuthorizedParties = getClerkAuthorizedParties();
const localhostOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

if (!clerkConfig.isConfigured) {
  console.error(
    `[startup] Missing Clerk environment variables: ${clerkConfig.missing.join(', ')}`
  );
} else {
  console.log('[startup] Clerk configured for backend auth middleware');
}

// Middleware
app.use(helmet());

const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser clients (curl, mobile apps) with no Origin header
    if (!origin || allowedOrigins.includes(origin) || localhostOriginPattern.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check should stay available even when Clerk env is misconfigured.
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    clerkConfigured: clerkConfig.isConfigured,
    corsOrigins: allowedOrigins,
    clerkAuthorizedParties,
  });
});

if (clerkConfig.isConfigured) {
  app.use(clerkMiddleware({
    publishableKey: clerkConfig.publishableKey,
    secretKey: clerkConfig.secretKey,
    authorizedParties: clerkAuthorizedParties,
  }));
} else {
  app.use((req, res, next) => {
    if (req.path === '/api/health') return next();
    return res.status(503).json({
      code: 'CLERK_NOT_CONFIGURED',
      message: 'Backend Clerk auth is not configured. Set CLERK_PUBLISHABLE_KEY and CLERK_SECRET_KEY.',
      missing: clerkConfig.missing,
    });
  });
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/meetings', meetingRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/session-requests', sessionRequestRoutes);
app.use('/api/personal-info', personalInfoRoutes);
app.use('/api/notifications', notificationRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
