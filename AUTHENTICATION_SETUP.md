# 🔐 MentorFlow Authentication - Quick Start Guide

## ✅ **AUTHENTICATION FULLY CONFIGURED**

All **246 users** (26 mentors + 220 students) can now login to MentorFlow!

---

## 🎯 Quick Start

### 1. Start the Backend
```bash
cd backend
npm start
```
Backend will run on: `http://localhost:5001`

### 2. Start the Frontend
```bash
# From project root
npm run dev
```
Frontend will run on: `http://localhost:5173` (or 8080)

### 3. Login
Use any user email with password: **`password123`**

---

## 👥 Sample Login Credentials

### Mentors (26 total)
| Name | Email | Password |
|------|-------|----------|
| Dr. Praveen Kumar Shukla | praveen.kr.shukla@jaipur.manipal.edu | password123 |
| Dr G.L Saini | gl.saini@jaipur.manipal.edu | password123 |
| Dr. Amita Nandal | amita.nandal@jaipur.manipal.edu | password123 |
| Prof. Michael Chen | prof.michael.chen@jaipur.manipal.edu | password123 |
| Dr. Emily Rodriguez | emily.rodriguez@jaipur.manipal.edu | password123 |

### Students (220 total)
| Name | Email | Password |
|------|-------|----------|
| Nishant Kumar | nishant.23fe10cii00012@muj.manipal.edu | password123 |
| AADI JAIN | AADI.23FE10CII00006@muj.manipal.edu | password123 |
| AADITYA MUKU | AADITYA.23FE10CII00133@muj.manipal.edu | password123 |
| AARADHYA JAIN | AARADHYA.23FE10CII00231@muj.manipal.edu | password123 |
| AAYUSH YADAV | AAYUSH.23FE10CII00129@muj.manipal.edu | password123 |

**Note:** See `backend/USERS_LIST.txt` for complete list of all 246 users.

---

## 🔧 API Endpoints

### Login
```bash
POST http://localhost:5001/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Verify Token
```bash
GET http://localhost:5001/api/auth/verify
Authorization: Bearer <your-jwt-token>
```

### Health Check
```bash
GET http://localhost:5001/api/health
```

---

## 🧪 Test Authentication

### Via cURL (Terminal)
```bash
# Test mentor login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"praveen.kr.shukla@jaipur.manipal.edu","password":"password123"}'

# Test student login
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"nishant.23fe10cii00012@muj.manipal.edu","password":"password123"}'
```

### Via Browser
1. Navigate to `http://localhost:5173` (or your frontend port)
2. Enter any user email
3. Enter password: `password123`
4. Click "Sign In"

---

## 🛠️ Utility Scripts

### Change Individual User Password
```bash
cd backend
node change-user-password.cjs
```
This interactive script allows you to change password for any specific user.

### View All Users
```bash
cd backend
cat USERS_LIST.txt
```

### Check Database
```bash
# See all mentors
psql -d mentorflow -c "SELECT name, email FROM users WHERE user_type = 'mentor' ORDER BY name;"

# See all students
psql -d mentorflow -c "SELECT name, email FROM users WHERE user_type = 'mentee' ORDER BY name;"

# Count users
psql -d mentorflow -c "SELECT user_type, COUNT(*) FROM users GROUP BY user_type;"
```

---

## 🔒 Security Features

- ✅ **Password Hashing:** bcrypt with 10 salt rounds
- ✅ **JWT Authentication:** 7-day expiration
- ✅ **Token Verification:** Secure token validation
- ✅ **Case-insensitive Email:** Works with any case
- ✅ **Active User Check:** Only active users can login
- ✅ **Email Validation:** Proper format required
- ✅ **Password Minimum:** 6 characters

---

## 📁 Key Files

### Backend
- `backend/src/routes/auth.js` - Authentication routes & logic
- `backend/src/config/database.js` - Database connection
- `backend/config.env` - Environment variables
- `backend/AUTHENTICATION.md` - Detailed auth documentation
- `backend/USERS_LIST.txt` - Complete list of all users
- `backend/change-user-password.cjs` - Password change utility

### Frontend
- `src/pages/Login.tsx` - Login page component
- `src/services/api.ts` - API service with auth methods

### Database
- `database/schema.sql` - Database schema
- `database/add-test-users.sql` - SQL template for test users

---

## ❓ Troubleshooting

### Problem: Cannot Login
**Solutions:**
1. Check backend is running: `curl http://localhost:5001/api/health`
2. Verify user exists in database
3. Ensure password is exactly: `password123`
4. Check browser console for errors
5. Clear browser cache/localStorage

### Problem: "Invalid credentials"
**Solutions:**
1. Double-check email spelling (case doesn't matter)
2. Ensure password is `password123` (case matters!)
3. Verify user is active in database:
   ```bash
   psql -d mentorflow -c "SELECT is_active FROM users WHERE email = 'user@example.com';"
   ```

### Problem: Backend not connecting to database
**Solutions:**
1. Check PostgreSQL is running: `psql -d mentorflow -c "SELECT 1;"`
2. Verify `backend/config.env` has correct database credentials
3. Check database exists: `psql -l | grep mentorflow`

### Problem: Token expired
**Solution:** Simply login again to get a new token. Tokens last 7 days.

---

## 🎓 User Types & Navigation

### After Login - Mentors
Redirected to: `/mentor/dashboard`
- View assigned mentees
- Schedule meetings
- Track session requests
- Generate reports
- Manage resources

### After Login - Students
Redirected to: `/` (Student dashboard)
- View mentor info
- See upcoming meetings
- Request 1-on-1 sessions
- Access resources
- Update personal info

---

## 📊 Database Statistics

- **Total Users:** 246
- **Mentors:** 26
- **Students:** 220
- **Active Relationships:** 220+
- **All passwords:** Properly hashed with bcrypt
- **Authentication:** Fully functional

---

## 🚀 Next Steps

1. ✅ Authentication is ready - **No action needed**
2. Start building features using authenticated routes
3. All API calls automatically include JWT token (handled by `api.ts`)
4. Users stay logged in for 7 days (token expiration)

---

## 📚 Additional Documentation

For more detailed information, see:
- `backend/AUTHENTICATION.md` - Complete authentication documentation
- `database/README.md` - Database setup and structure
- `README.md` - Main project documentation

---

## ⚠️ Important Notes

1. **Default Password:** All users currently have `password123` - this is fine for development
2. **Production:** Before going live, implement individual password setup and reset functionality
3. **Security:** The JWT_SECRET in `config.env` should be changed for production
4. **HTTPS:** Use HTTPS in production for secure authentication

---

## 🎉 Success!

Your MentorFlow application now has **full authentication** for all 246 users!

**Start the app and login with any user credentials listed above.**

---

*Last Updated: November 2, 2025*  
*Status: ✅ Fully Operational*

