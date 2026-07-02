# Backend Authentication

## Model

The backend trusts Clerk for identity and PostgreSQL for app authorization.

Every protected route uses `backend/src/middleware/authenticate.js`.

The middleware:

1. Reads the Clerk auth state from `@clerk/express`.
2. Loads the Clerk user and primary email.
3. Finds an active `users` row by `clerk_user_id` or email.
4. Links `clerk_user_id` on first successful provisioned login.
5. Rejects unprovisioned, inactive, or invalid-role users.
6. Sets `req.user` for downstream routes.

## Endpoints

### `GET /api/auth/session`

Returns the app session for a valid Clerk session token.

Response:

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name",
    "user_type": "mentor"
  },
  "role": "mentor",
  "requiresPasswordSetup": true
}
```

### `POST /api/auth/password-setup-complete`

Marks the database user as having completed first-login password setup after Clerk accepts the new password.

### `GET /api/auth/verify`

Compatibility endpoint that verifies the Clerk session and returns the active database user.

### Disabled Endpoints

`POST /api/auth/login` and `POST /api/auth/register` no longer create app sessions. Passwords are handled by Clerk, and app access is limited to provisioned database users.

## Error Codes

- `UNAUTHENTICATED`
- `EMAIL_MISSING`
- `USER_NOT_PROVISIONED`
- `USER_INACTIVE`
- `ACCOUNT_LINK_CONFLICT`
- `INVALID_ROLE`
- `AUTHENTICATION_FAILED`

## Required Environment

```bash
CLERK_SECRET_KEY=sk_...
DATABASE_URL=...
```

## Migration

Run:

```bash
npm run migrate:clerk-auth
```

This adds the Clerk mapping and login metadata columns to `users`.
