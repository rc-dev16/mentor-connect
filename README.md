# Mentor Connect 🎓

A modern, full-stack mentorship management platform connecting mentors and mentees in educational institutions. Built with React, Node.js, and PostgreSQL, featuring secure OTP-based authentication via Clerk.

[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22.x-green)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-blue)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-purple)](https://clerk.com/)

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Database Setup](#database-setup)
- [Contributing](#contributing)
- [License](#license)

## 🎯 Overview

Mentor Connect is a comprehensive mentorship platform designed to facilitate seamless communication and collaboration between mentors and mentees. The platform supports role-based access control, meeting management, resource sharing, session requests, and comprehensive reporting.

### Key Highlights

- ✅ **Secure Authentication**: OTP-first login with Clerk, password setup after initial login
- ✅ **Role-Based Access**: Separate dashboards and features for mentors and mentees
- ✅ **Meeting Management**: Schedule group meetings, track attendance, and manage session requests
- ✅ **Resource Sharing**: Upload and share documents, links, and educational materials
- ✅ **Real-time Notifications**: Stay updated with mentorship activities
- ✅ **Personal Information Management**: Comprehensive profile and personal info tracking
- ✅ **Production Ready**: Deployed on Railway with PostgreSQL database

## ✨ Features

### For Mentors 👨‍🏫

- **Dashboard**: Overview of mentees, upcoming meetings, and pending requests
- **My Mentees**: View all assigned mentees with detailed profiles
- **Meetings**: Schedule group meetings, track attendance, add notes and action points
- **Session Requests**: Approve/reject 1-on-1 session requests from mentees
- **Resources**: Upload PDFs, documents, and external links for mentees
- **Reports**: Generate mentorship activity reports and analytics
- **Settings**: Manage profile, cabin location, and availability schedule

### For Mentees 👨‍🎓

- **Dashboard**: View assigned mentor details, upcoming meetings, and notifications
- **Meetings**: Access scheduled meetings, view history, and meeting notes
- **Mentorship Connect**: Request 1-on-1 sessions with preferred date/time
- **Personal Info**: Update and manage personal information
- **Resources**: Access resources shared by assigned mentor
- **Notifications**: Receive updates on mentorship activities
- **Settings**: Manage profile and account settings

## 🛠 Tech Stack

### Frontend
- **React 18.3.1** with TypeScript
- **Vite 5.4.19** - Build tool and dev server
- **React Router 6** - Client-side routing
- **shadcn/ui** - UI component library (Radix UI)
- **Tailwind CSS** - Utility-first CSS framework
- **TanStack Query** - Data fetching and caching
- **Clerk React** - Authentication SDK
- **Recharts** - Data visualization
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend
- **Node.js 22.x** with Express
- **PostgreSQL** - Relational database
- **Clerk SDK Node** - Server-side authentication
- **Multer** - File upload handling
- **PDFKit** - PDF generation
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Morgan** - HTTP request logger
- **Express Validator** - Input validation

### Infrastructure
- **Railway** - Hosting platform (Frontend, Backend, Database)
- **Clerk** - Authentication service
- **PostgreSQL** - Database (Railway managed)

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or higher
- **npm** or **yarn**
- **PostgreSQL** 15+ (for local development)
- **Git**

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/rc-dev16/mentor-connect.git
   cd mentor-connect
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

4. **Set up environment variables** (see [Environment Variables](#environment-variables))

5. **Set up the database** (see [Database Setup](#database-setup))

## 🔐 Environment Variables

### Frontend (`.env.local`)

Create a `.env.local` file in the root directory:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_BASE_URL=http://localhost:5001/api
VITE_CLERK_JWT_TEMPLATE=backend
```

### Backend (`backend/config.env`)

Create `backend/config.env`:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/mentorflow
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mentorflow
DB_USER=your_username
DB_PASSWORD=your_password

# JWT Configuration (Legacy - for backward compatibility)
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5001
NODE_ENV=development

# CORS Configuration
CORS_ORIGIN=http://localhost:8080

# Clerk Authentication
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_AUD=backend
CLERK_AUTHORIZED_PARTIES=http://localhost:8080
```

## 🏃 Running Locally

### Start Backend Server

```bash
cd backend
npm run dev
```

Backend will run on `http://localhost:5001`

### Start Frontend Development Server

```bash
npm run dev
```

Frontend will run on `http://localhost:8080`

### Access the Application

- Frontend: http://localhost:8080
- Backend API: http://localhost:5001/api
- Health Check: http://localhost:5001/api/health

## 🌐 Deployment

### Railway Deployment

The application is configured for deployment on Railway:

1. **Database Setup**
   - Create a PostgreSQL service on Railway
   - Copy the `DATABASE_URL` from Railway
   - Run database migrations:
     ```bash
     psql "$DATABASE_URL" -f database/schema.sql
     psql "$DATABASE_URL" -f database/add-personal-info-schema.sql
     ```

2. **Backend Deployment**
   - Create a new Railway service from the `backend` directory
   - Set environment variables in Railway dashboard
   - Railway will auto-detect Node.js and deploy

3. **Frontend Deployment**
   - Create a new Railway service from the root directory
   - Set environment variables:
     - `VITE_CLERK_PUBLISHABLE_KEY`
     - `VITE_API_BASE_URL` (your backend Railway URL)
     - `VITE_CLERK_JWT_TEMPLATE=backend`
   - Railway will build and deploy using `nixpacks.toml`

### Clerk Configuration

After deployment, configure Clerk Dashboard:

1. **Authorized Origins**: Add your Railway frontend URL
2. **Redirect URLs**: Add `https://your-app.up.railway.app/*`
3. **JWT Template**: Create a template named `backend` with `email_address` claim
4. **Email Domain Allowlist**: Add `@jaipur.manipal.edu` and `@muj.manipal.edu`

## 📁 Project Structure

```
mentor-connect/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── middleware/     # Authentication middleware
│   │   ├── routes/         # API route handlers
│   │   └── server.js       # Express server
│   ├── uploads/            # File storage
│   └── config.env          # Environment variables
├── src/                    # Frontend React app
│   ├── components/         # Reusable components
│   ├── mentee/             # Mentee-specific pages
│   ├── mentor/             # Mentor-specific pages
│   ├── pages/              # Shared pages
│   ├── services/           # API service layer
│   └── main.tsx            # App entry point
├── database/               # Database scripts
│   ├── schema.sql          # Main database schema
│   ├── import-all-users-and-mappings.cjs
│   └── cleanup-test-data.cjs
├── public/                 # Static assets
├── server.js               # Production Express server (frontend)
├── vite.config.ts          # Vite configuration
└── package.json            # Frontend dependencies
```

## 📡 API Documentation

### Authentication

All API endpoints (except `/api/health`) require authentication via Clerk JWT token in the `Authorization` header:

```
Authorization: Bearer <clerk-jwt-token>
```

### Main Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Health check |
| `/api/users/profile` | GET | Get current user profile |
| `/api/users/profile` | PUT | Update user profile |
| `/api/users/my-mentor` | GET | Get assigned mentor (mentees only) |
| `/api/meetings` | GET | Get meetings |
| `/api/meetings` | POST | Create meeting (mentors only) |
| `/api/session-requests` | GET | Get session requests |
| `/api/session-requests` | POST | Create session request (mentees only) |
| `/api/resources` | GET | Get resources |
| `/api/resources` | POST | Upload resource (mentors only) |
| `/api/personal-info` | GET | Get personal information |
| `/api/personal-info` | POST | Save personal information |
| `/api/notifications` | GET | Get notifications |

For detailed API documentation, refer to the route files in `backend/src/routes/`.

## 🗄 Database Setup

### Initial Setup

1. **Create database**
   ```bash
   createdb mentorflow
   ```

2. **Run schema migrations**
   ```bash
   psql mentorflow -f database/schema.sql
   psql mentorflow -f database/add-personal-info-schema.sql
   ```

3. **Import users and mappings** (optional)
   ```bash
   cd backend
   set -a; source config.env; set +a
   cd ../database
   node import-all-users-and-mappings.cjs
   ```

### Database Schema

Key tables:
- `users` - Mentors and mentees
- `mentorship_relationships` - Mentor-mentee assignments
- `meetings` - Meeting records
- `session_requests` - 1-on-1 session requests
- `resources` - Shared resources
- `personal_information` - Extended user information
- `notifications` - User notifications

See `database/schema.sql` for complete schema.

## 🧪 Testing

### Create Test Users

```bash
cd backend
set -a; source config.env; set +a
cd ../database
node create-2-test-users.cjs
```

Then sign up these emails in Clerk Dashboard:
- `test.mentor@jaipur.manipal.edu`
- `test.mentee@muj.manipal.edu`

### Cleanup Test Data

```bash
cd backend
set -a; source config.env; set +a
cd ../database
node cleanup-test-data.cjs
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

- Use TypeScript for frontend code
- Follow ESLint configuration
- Remove console.log statements from production code
- Keep console.error for actual error handling
- Write meaningful commit messages

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- **Mentor Connect Team**

## 🙏 Acknowledgments

- [Clerk](https://clerk.com/) for authentication
- [shadcn/ui](https://ui.shadcn.com/) for UI components
- [Railway](https://railway.app/) for hosting infrastructure
- [Vite](https://vitejs.dev/) for build tooling

## 📞 Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built with ❤️ for educational institutions**
