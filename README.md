# MentorFlow - Mentor-Student Management Platform

A comprehensive mentorship management system connecting 26 mentors with 220 students, built with modern web technologies to facilitate seamless communication, resource sharing, and mentorship tracking.

## 📋 Table of Contents

- [Executive Summary](#executive-summary)
- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Core Features](#core-features)
- [Authentication & Security](#authentication--security)
- [Installation & Setup](#installation--setup)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Testing](#testing)
- [Deployment](#deployment)
- [Project Statistics](#project-statistics)
- [Documentation](#documentation)

---

## Executive Summary

**MentorFlow** is a full-stack mentorship management platform designed to streamline the relationship between mentors and mentees in an educational institution. The system supports 246 users (26 mentors and 220 students) with role-based access control, meeting management, resource sharing, and comprehensive reporting capabilities.

**Status:** ✅ Fully Operational  
**Authentication:** ✅ Active for all 246 users  
**Default Password:** `password123` (for all users)

---

## Project Overview

### Mission
Provide a centralized platform for managing mentorship relationships, facilitating communication, scheduling meetings, sharing resources, and tracking mentorship progress between mentors and their assigned mentees.

### Scale
- **Total Users:** 246
  - **Mentors:** 26
  - **Mentees (Students):** 220
- **Active Relationships:** 220+ mentor-mentee pairs
- **Database Tables:** 11 core tables
- **API Endpoints:** 8 main route groups

### Project URL
**Lovable Project:** https://lovable.dev/projects/647c0ca0-bdbf-4999-91ea-42b3a9446ff7

---

## Technology Stack

### Frontend
- **Framework:** React 18.3.1 with TypeScript
- **Build Tool:** Vite 5.4.19
- **UI Library:** shadcn-ui (Radix UI components)
- **Styling:** Tailwind CSS 3.4.17
- **Routing:** React Router DOM 6.30.1
- **State Management:** TanStack React Query 5.83.0
- **Forms:** React Hook Form 7.61.1 + Zod 3.25.76
- **Charts:** Recharts 2.15.4
- **Date Handling:** date-fns 3.6.0
- **Icons:** Lucide React

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js 4.18.2
- **Database:** PostgreSQL with pg 8.11.3
- **Authentication:** JWT (jsonwebtoken 9.0.2) + bcryptjs 2.4.3
- **File Upload:** Multer 2.0.2
- **PDF Generation:** PDFKit 0.17.2
- **Security:** Helmet 7.1.0, CORS
- **Validation:** express-validator 7.0.1
- **Logging:** Morgan 1.10.0

### Database
- **Type:** PostgreSQL
- **Extensions:** UUID generation (uuid-ossp)
- **Schema:** 11 tables with proper relationships, indexes, and triggers

---

## System Architecture

### Frontend Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn-ui components
│   ├── Layout.tsx      # Main layout wrapper
│   ├── Sidebar.tsx     # Mentee sidebar
│   └── Topbar.tsx      # Top navigation bar
├── mentor/             # Mentor-specific modules
│   ├── pages/          # Dashboard, Meetings, Mentees, Reports, Resources, SessionRequests
│   └── components/     # MentorLayout, MentorSidebar, MentorTopbar, MenteeProfileDialog
├── mentee/             # Mentee-specific modules
│   └── pages/          # Dashboard, Meetings, MentorshipConnect, PersonalInfo, Resources
├── pages/              # Shared pages (Login, Settings, NotFound)
├── services/           # API service layer (api.ts)
├── hooks/              # Custom React hooks
└── lib/                # Utility functions
```

### Backend Structure
```
backend/
├── src/
│   ├── config/         # Database configuration
│   ├── controllers/    # Business logic
│   ├── middleware/     # Authentication, validation middleware
│   ├── models/         # Data models
│   ├── routes/         # API route handlers
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── meetings.js
│   │   ├── resources.js
│   │   ├── reports.js
│   │   ├── session-requests.js
│   │   ├── personal-info.js
│   │   └── notifications.js
│   └── server.js       # Express server setup
├── uploads/            # File storage (resources/)
└── config.env          # Environment configuration
```

### API Routes
- `/api/auth` - Authentication (login, verify)
- `/api/users` - User management and profiles
- `/api/meetings` - Meeting scheduling and management
- `/api/resources` - Resource upload and management
- `/api/reports` - Report generation
- `/api/session-requests` - 1-on-1 session requests
- `/api/personal-info` - Personal information management
- `/api/notifications` - Notification system

---

## Core Features

### For Mentors

#### 1. Dashboard
- View total mentees count
- Upcoming meetings overview
- Pending session requests counter
- Completed sessions tracking
- Recent notifications feed
- Quick access to all features

#### 2. My Mentees
- View all assigned mentees
- Access detailed mentee profiles
- Download mentee personal information as PDF
- View mentorship relationship details

#### 3. Meetings
- Schedule group meetings
- Create and manage meeting groups
- Track attendance for meetings
- Add meeting notes and action points
- Download meeting reports as PDF
- Microsoft Teams link integration
- Meeting status management (scheduled, completed, cancelled)

#### 4. Session Requests
- View mentee 1-on-1 session requests
- Approve or reject requests
- Schedule approved sessions
- Add mentor notes to requests
- Track request status

#### 5. Resources
- Upload PDF/Word documents
- Add external resource links
- Organize resources with tags
- View all uploaded resources
- Manage resource visibility

#### 6. Reports
- Generate mentorship activity reports
- View activity summaries
- Export data for analysis
- Track mentorship progress

#### 7. Settings
- Update profile information
- Set phone number
- Set cabin location
- Set availability schedule
- Change password

### For Mentees

#### 1. Dashboard
- View assigned mentor information
  - Mentor name and email
  - Phone number
  - Cabin location
  - Availability schedule
- Upcoming meetings list
- Recent notifications
- Quick access to key features

#### 2. Meetings
- View scheduled meetings
- Access meeting details (date, time, Teams link)
- View meeting history
- Access meeting notes and action points
- Track attendance status

#### 3. Mentorship Connect
- Request 1-on-1 sessions with mentor
- View session request status
- Add preferred date and time
- Provide session description

#### 4. Personal Info
- Update personal information
- View profile details
- Manage registration information

#### 5. Resources
- Access resources uploaded by assigned mentor
- Download documents
- View external links
- Receive notifications when new resources are added

#### 6. Settings
- Update profile information
- Change password
- Manage account settings

---

## Authentication & Security

### Authentication System
- **Method:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt with 10 salt rounds
- **Token Expiration:** 7 days
- **Default Password:** `password123` (for all 246 users)

### Security Features
- ✅ Password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ Token verification middleware
- ✅ Case-insensitive email matching
- ✅ Active user validation
- ✅ Email format validation
- ✅ Minimum password length (6 characters)
- ✅ CORS configuration
- ✅ Helmet.js security headers
- ✅ Role-based access control

### User Access
- Role-based routing (mentor vs mentee)
- Protected routes with authentication checks
- Automatic redirect based on user type
- Session persistence via localStorage

### Sample Login Credentials

**Mentors:**
- `praveen.kr.shukla@jaipur.manipal.edu` / `password123`
- `gl.saini@jaipur.manipal.edu` / `password123`
- `amita.nandal@jaipur.manipal.edu` / `password123`

**Mentees:**
- `nishant.23fe10cii00012@muj.manipal.edu` / `password123`
- `AADI.23FE10CII00006@muj.manipal.edu` / `password123`

📖 **[Complete Authentication Guide →](AUTHENTICATION_SETUP.md)**

---

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher) & npm
- PostgreSQL database
- Git

### Installation Steps

```bash
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>
cd mentorflow-orange

# Step 2: Install frontend dependencies
npm install

# Step 3: Install backend dependencies
cd backend
npm install
cd ..

# Step 4: Configure environment
# Edit backend/config.env with your database credentials:
# - DB_HOST
# - DB_PORT
# - DB_NAME
# - DB_USER
# - DB_PASSWORD
# - JWT_SECRET
# - PORT (default: 5001)

# Step 5: Setup database
# Run database/schema.sql in PostgreSQL to create tables

# Step 6: (Optional) Run database migrations
cd backend
npm run migrate:cabin-availability
cd ..

# Step 7: Start the backend server (Terminal 1)
cd backend
npm start
# Backend runs on http://localhost:5001

# Step 8: Start the frontend server (Terminal 2)
npm run dev
# Frontend runs on http://localhost:5173

# Step 9: Login
# Open http://localhost:5173
# Use any user email with password: password123
```

### 🚀 Quick Start

1. **Start Backend:** `cd backend && npm start`
2. **Start Frontend:** `npm run dev` (in project root)
3. **Login:** Use any user email with password `password123`

### Environment Configuration

**Backend (`backend/config.env`):**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mentorflow
DB_USER=your_username
DB_PASSWORD=your_password
JWT_SECRET=your_jwt_secret_key
PORT=5001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

**Ports:**
- Backend: `http://localhost:5001`
- Frontend: `http://localhost:5173` (or 8080)
- API Base: `http://localhost:5001/api`

---

## API Documentation

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Verify Token
```http
GET /api/auth/verify
Authorization: Bearer <jwt-token>
```

#### Health Check
```http
GET /api/health
```

### Main Endpoints

- **Users:** `/api/users/*` - User profiles and management
- **Meetings:** `/api/meetings/*` - Meeting CRUD operations
- **Resources:** `/api/resources/*` - Resource upload and retrieval
- **Reports:** `/api/reports/*` - Report generation
- **Session Requests:** `/api/session-requests/*` - 1-on-1 session management
- **Personal Info:** `/api/personal-info/*` - Personal information management
- **Notifications:** `/api/notifications/*` - Notification system

All endpoints require JWT authentication (except login and health check).

---

## Database Schema

### Core Tables

1. **users** - Stores both mentors and mentees (246 records)
   - id, email, password_hash, name, user_type
   - registration_number, department, phone, cabin, availability
   - bio, profile_image_url, is_active

2. **mentorship_relationships** - Links mentors to mentees
   - mentor_id, mentee_id, status, start_date, end_date, notes

3. **meetings** - Meeting records
   - mentor_id, group_id, title, topic, agenda
   - meeting_date, meeting_time, duration_minutes
   - teams_link, status, comments, action_points

4. **meeting_groups** - Group meeting organization
   - name, description, mentor_id

5. **group_memberships** - Mentee-group associations
   - group_id, mentee_id, joined_at

6. **meeting_attendance** - Attendance tracking
   - meeting_id, mentee_id, attended, notes

7. **session_requests** - 1-on-1 session requests
   - mentee_id, mentor_id, title, description
   - preferred_date, preferred_time, duration_minutes
   - status, mentor_notes

8. **resources** - Uploaded files and links
   - title, description, resource_type, file_url
   - file_size, mime_type, uploaded_by, is_public, tags

9. **resource_permissions** - Access control
   - resource_id, user_id, permission_type

10. **notifications** - User notifications
    - user_id, title, message, type, is_read
    - related_entity_type, related_entity_id

11. **reports** - Generated reports
    - mentor_id, report_type, title, content
    - period_start, period_end

### Database Features
- UUID primary keys for all tables
- Foreign key constraints with CASCADE deletes
- Automatic timestamp triggers (created_at, updated_at)
- Indexed columns for performance optimization
- Check constraints for data integrity

See `database/schema.sql` for complete schema definition.

---

## Testing

### Test Credentials

**Mentors:**
- `praveen.kr.shukla@jaipur.manipal.edu` / `password123`
- `gl.saini@jaipur.manipal.edu` / `password123`
- `sunil.kumar.d@jaipur.manipal.edu` / `password123`

**Mentees:**
- `nishant.23fe10cii00012@muj.manipal.edu` / `password123`
- `ANANYA.23FE10CII00132@muj.manipal.edu` / `password123`
- `PRAGATI.23FE10CII00130@muj.manipal.edu` / `password123`

### Testing Methods

1. **Multiple Browser Windows** - Open two windows, login as different users
2. **Incognito/Private Window** - Test separate sessions
3. **Different Browsers** - Use Chrome for mentor, Firefox for mentee
4. **Browser Profiles** - Create separate profiles for testing

### Test Scenarios

- ✅ Mentor-mentee interactions
- ✅ Meeting scheduling and updates
- ✅ Session request workflow
- ✅ Resource sharing
- ✅ Notification delivery
- ✅ PDF generation and downloads

📖 **[Complete Testing Guide →](TESTING_GUIDE.md)**

---

## Deployment

### Platform: Lovable.dev

**Deployment Steps:**
1. Open [Lovable Project](https://lovable.dev/projects/647c0ca0-bdbf-4999-91ea-42b3a9446ff7)
2. Click on **Share → Publish**
3. Follow the deployment wizard

### Custom Domain
- Navigate to **Project > Settings > Domains**
- Click **Connect Domain**
- Follow domain configuration steps

### Production Considerations

Before deploying to production:
- ✅ Change default passwords for all users
- ✅ Update JWT_SECRET in environment variables
- ✅ Enable HTTPS
- ✅ Configure production database
- ✅ Set up proper file storage (cloud storage recommended)
- ✅ Configure CORS for production domain
- ✅ Set NODE_ENV to 'production'
- ✅ Implement individual password reset functionality
- ✅ Set up email notifications
- ✅ Configure backup strategy

---

## New Features (November 2025)

### Resources System
- ✅ Mentors can upload PDF/Word files or add links
- ✅ Files stored securely and served via authenticated endpoints
- ✅ Role-based visibility (mentors see their uploads, mentees see mentor's resources)
- ✅ Automatic notifications when mentors add resources

### PDF Export Features
- ✅ **Personal Info PDF:** Mentors can download individual mentee information
- ✅ **Meeting Reports PDF:** Download meeting notes and attendance for completed meetings

### Mentor Profile Enhancements
- ✅ Phone number field
- ✅ Cabin location field
- ✅ Availability schedule field
- ✅ Displayed on mentee dashboard under "Your Mentor"

### Database Migrations
- ✅ Added `cabin` and `availability` columns to users table
- ✅ Migration script: `backend/add-cabin-availability-columns.cjs`
- ✅ Run: `cd backend && npm run migrate:cabin-availability`

---

## Resource Visibility Rules

- **Mentor View:**
  - Sees only resources they uploaded
  
- **Mentee View:**
  - Sees only resources from their assigned mentor
  
- **Notes:**
  - Public flag is not used for cross-mentor visibility
  - Resources are scoped to the mentor-mentee relationship

---

## Project Statistics

- **Total Users:** 246
- **Mentors:** 26
- **Mentees:** 220
- **Active Relationships:** 220+
- **Database Tables:** 11
- **API Route Groups:** 8
- **Frontend Routes:** 14+ protected routes
- **Authentication Status:** ✅ Fully Operational

---

## Documentation

### Available Documentation Files

- **README.md** (this file) - Main project documentation
- **[AUTHENTICATION_SETUP.md](AUTHENTICATION_SETUP.md)** - Complete authentication guide
- **[TESTING_GUIDE.md](TESTING_GUIDE.md)** - Testing instructions and scenarios
- **backend/AUTHENTICATION.md** - Detailed authentication documentation
- **database/README.md** - Database setup and structure guide
- **database/schema.sql** - Complete database schema

### Additional Resources

- **User List:** `backend/USERS_LIST.txt` - Complete list of all 246 users
- **Database Scripts:** `database/` - SQL scripts and migrations
- **Utility Scripts:** `backend/` - Password change, CSV export utilities

---

## Development Workflow

### Editing Code

**Option 1: Use Lovable**
- Visit [Lovable Project](https://lovable.dev/projects/647c0ca0-bdbf-4999-91ea-42b3a9446ff7)
- Changes are automatically committed to the repository

**Option 2: Use Your IDE**
- Clone repository and work locally
- Push changes to sync with Lovable

**Option 3: GitHub**
- Edit files directly in GitHub
- Use GitHub Codespaces for cloud development

---

## Future Enhancements

Potential improvements for future versions:
- Individual password reset functionality
- Email notification system
- Real-time chat/messaging
- Video conferencing integration
- Mobile application
- Advanced analytics and reporting
- Calendar integration (Google Calendar, Outlook)
- Bulk operations for mentors
- Admin dashboard
- Multi-language support
- Advanced search functionality

---

## License

MIT License (as per backend package.json)

---

## Support & Contact

For issues, questions, or contributions:
- Check documentation files in the repository
- Review [AUTHENTICATION_SETUP.md](AUTHENTICATION_SETUP.md) for auth-related issues
- Review [TESTING_GUIDE.md](TESTING_GUIDE.md) for testing scenarios

---

**Last Updated:** November 2025  
**Status:** ✅ Fully Operational  
**Version:** 1.0.0
