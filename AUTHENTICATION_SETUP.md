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
CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
DATABASE_URL=...
CORS_ORIGIN=http://localhost:8080,http://127.0.0.1:8080
CLERK_AUTHORIZED_PARTIES=http://localhost:8080,http://127.0.0.1:8080
```

`CLERK_PUBLISHABLE_KEY` is required on the backend for `@clerk/express`. Without it, hosted auth routes fail.

## Production Deployment (Railway + Clerk)

Use the same Clerk application keys on both frontend and backend services.

Frontend Railway service:

```bash
VITE_CLERK_PUBLISHABLE_KEY=pk_...
VITE_API_BASE_URL=https://<your-backend-service>.up.railway.app/api
```

Backend Railway service:

```bash
CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
DATABASE_URL=postgresql://...
CORS_ORIGIN=https://<your-frontend-service>.up.railway.app
CLERK_AUTHORIZED_PARTIES=https://<your-frontend-service>.up.railway.app
FRONTEND_URL=https://<your-frontend-service>.up.railway.app
NODE_ENV=production
```

In the Clerk Dashboard:

1. Open your Clerk application.
2. Add your hosted frontend domain under allowed origins/domains.
3. If using a production Clerk instance, use the production `pk_` / `sk_` keys on Railway.
4. Redeploy frontend and backend after changing env vars.

Verify backend health after deploy:

```bash
curl https://<your-backend-service>.up.railway.app/api/health
```

Expected:

```json
{
  "status": "OK",
  "clerkConfigured": true
}
```

If `clerkConfigured` is `false`, set the missing Clerk env vars on the backend Railway service and redeploy.

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

## Database Setup

Fresh database:

```bash
psql "$DATABASE_URL" -f database/schema.sql
```

[`database/schema.sql`](database/schema.sql) includes Clerk auth columns and mentor profile fields.

For local development, seed test users and sync Clerk IDs:

```bash
node database/create-2-test-users.cjs
node database/sync-clerk-test-users.cjs
```

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
