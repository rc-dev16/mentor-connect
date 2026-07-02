# Mentor-Connect Authentication Setup

## Current Auth Model

Mentor-Connect uses Clerk for identity and the application database for authorization.

- Clerk handles email OTP and password sign-in.
- The database controls who can access the app.
- Only active users imported/provisioned in the `users` table can enter Mentor-Connect.
- A Clerk-authenticated email that is not in the database is blocked.
- First-time users sign in with email OTP, then set a password for future password login.

## Required Environment

Frontend:

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_...
VITE_API_BASE_URL=http://localhost:5001/api
```

Backend:

```bash
CLERK_SECRET_KEY=sk_...
DATABASE_URL=...
CORS_ORIGIN=http://localhost:8080,http://127.0.0.1:8080
```

## Local Startup

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
npm run dev
```

## Database Migration

Run this once for existing databases:

```bash
cd backend
npm run migrate:clerk-auth
```

This adds:

- `users.clerk_user_id`
- `users.password_setup_completed`
- `users.last_login_at`

## Test Users

The test seed maps:

- Mentor: `chawdarohan16@gmail.com`
- Mentee: `rohanc1604@gmail.com`

Run:

```bash
node database/create-2-test-users.cjs
```

These emails must be able to receive Clerk OTP codes.

## Sign-In Flow

1. Open `/login`.
2. Choose `Email code`.
3. Enter a provisioned email.
4. Verify the OTP from Clerk.
5. If first login, set a password.
6. The backend checks the database role and redirects:
   - mentor -> `/mentor/dashboard`
   - mentee -> `/dashboard`

## Blocked Cases

- Email not in database: blocked as not provisioned.
- Inactive database user: blocked as inactive.
- Invalid role: blocked.
- Password login before first OTP/password setup: user should use email code first.

## Important Notes

- Do not create app users automatically from Clerk signups.
- Do not store new app passwords in the database.
- Mentor/mentee relationships continue to come from the database.
- The legacy `/api/auth/login` JWT password endpoint is disabled.
