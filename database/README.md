# Database

Essential database files for Mentor-Connect.

## Files

| File | Purpose |
|------|---------|
| `schema.sql` | Full PostgreSQL schema (tables, indexes, triggers) |
| `create-2-test-users.cjs` | Seed local test mentor/mentee in the database |
| `sync-clerk-test-users.cjs` | Link test users to Clerk and set `clerk_user_id` |
| `cleanup-test-data.cjs` | Remove test users and related data |

## Fresh setup

```bash
psql "$DATABASE_URL" -f database/schema.sql
node database/create-2-test-users.cjs
node database/sync-clerk-test-users.cjs
```

Requires `backend/config.env` (or env vars) with `DATABASE_URL` and Clerk keys for sync.

## Test users

- Mentor: `chawdarohan16@gmail.com`
- Mentee: `rohanc1604@gmail.com`

These emails must exist in Clerk and receive OTP codes for local sign-in.
