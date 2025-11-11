# MentorFlow Authentication Setup

## 🔐 Authentication Status: **ACTIVE**

All 246 users (26 mentors + 220 students) have been configured with authentication.

## Default Credentials

**Password for ALL users:** `password123`

### Sample Login Credentials

#### Mentors (26 total)
```
Email: praveen.kr.shukla@jaipur.manipal.edu
Email: gl.saini@jaipur.manipal.edu
Email: amita.nandal@jaipur.manipal.edu
Password: password123
```

#### Students (220 total)
```
Email: nishant.23fe10cii00012@muj.manipal.edu
Email: AADI.23FE10CII00006@muj.manipal.edu
Email: AADITYA.23FE10CII00133@muj.manipal.edu
Password: password123
```

## API Endpoints

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "token": "JWT_TOKEN_HERE",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "user_type": "mentor|mentee",
    ...
  }
}
```

### Verify Token
```bash
GET /api/auth/verify
Authorization: Bearer JWT_TOKEN

Response:
{
  "user": { ... }
}
```

### Register (Testing Only)
```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "New User",
  "userType": "mentor|mentee",
  "registrationNumber": "REG123",
  "department": "Computer Science",
  "phone": "+91-1234567890",
  "bio": "User bio"
}
```

## Scripts

### Setup All Passwords
Reset/set passwords for all users in the database:

```bash
cd backend
node setup-all-passwords.cjs
```

This will:
- Connect to the database
- Generate bcrypt hash for the default password
- Update all active users with the new password
- Show summary of updated users

### Change Default Password

To change the default password for all users, edit `setup-all-passwords.cjs`:

```javascript
const DEFAULT_PASSWORD = 'your_new_password_here';
```

Then run the script again.

## Security Features

✅ **Password Hashing:** All passwords are hashed using bcrypt with 10 salt rounds  
✅ **JWT Tokens:** Secure token-based authentication with 7-day expiration  
✅ **Case-insensitive Email:** Login works regardless of email case  
✅ **Active User Check:** Only active users can login  
✅ **Password Validation:** Minimum 6 characters required  
✅ **Email Validation:** Proper email format required  

## Testing Authentication

### Test via cURL
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

### Test via Frontend
1. Start the backend: `cd backend && npm start`
2. Start the frontend: `npm run dev`
3. Navigate to login page
4. Use any user email with password: `password123`

## Database Schema

Users table includes:
- `id` (UUID) - Primary key
- `email` (VARCHAR) - Unique, used for login
- `password_hash` (VARCHAR) - Bcrypt hashed password
- `name` (VARCHAR) - User's full name
- `user_type` (VARCHAR) - 'mentor' or 'mentee'
- `is_active` (BOOLEAN) - Must be true to login
- ... other profile fields

## Troubleshooting

### Cannot Login
1. Check backend is running: `curl http://localhost:5001/api/health`
2. Verify user exists: `psql -d mentorflow -c "SELECT email, is_active FROM users WHERE email = 'user@example.com';"`
3. Check user is active: `is_active` should be `true`
4. Re-run password setup: `node setup-all-passwords.cjs`

### Password Not Working
Run the password setup script again:
```bash
cd backend
node setup-all-passwords.cjs
```

### Database Connection Issues
Check `backend/config.env`:
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mentorflow
DB_USER=your_username
DB_PASSWORD=your_password
```

## Production Considerations

⚠️ **Before deploying to production:**

1. **Change Default Password:** Don't use `password123` in production
2. **Individual Passwords:** Set unique passwords for each user
3. **Password Reset:** Implement password reset functionality
4. **Environment Variables:** Use secure JWT_SECRET (not fallback)
5. **HTTPS Only:** Enforce HTTPS for all authentication endpoints
6. **Rate Limiting:** Add rate limiting to prevent brute force attacks
7. **Email Verification:** Consider adding email verification
8. **2FA:** Consider implementing two-factor authentication

## Files

- `backend/src/routes/auth.js` - Authentication routes
- `backend/src/config/database.js` - Database connection
- `backend/setup-all-passwords.cjs` - Password setup script
- `backend/config.env` - Environment configuration
- `src/pages/Login.tsx` - Frontend login page
- `src/services/api.ts` - API service layer

## Support

For issues or questions, check:
1. Backend logs: Check terminal where backend is running
2. Database logs: `psql -d mentorflow`
3. Frontend console: Browser developer tools
4. Network tab: Check API request/response details

