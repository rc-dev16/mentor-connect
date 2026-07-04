# Testing Guide

## Test Users

Use these provisioned users for Clerk email OTP testing:

- Mentor: `chawdarohan16@gmail.com`
- Mentee: `rohanc1604@gmail.com`

The mentor is linked to the mentee by one active mentorship relationship.

## First Login

1. Open the app in a browser.
2. Go to `/login`.
3. Choose `Email code`.
4. Enter one of the provisioned test emails.
5. Verify the Clerk OTP from that inbox.
6. Confirm the redirect:
   - Mentor -> `/mentor/dashboard`
   - Mentee -> `/dashboard`
7. A pinned banner below the topbar prompts you to set a password in **Settings**.
8. Open Settings, use the Security card to set your password.

## Later Login

After first password setup, either sign-in option should work:

- Email code
- Password

## Testing Both Roles

Use separate browser contexts so Clerk sessions do not overlap:

- Normal browser window for mentor.
- Incognito/private window for mentee.

Browser profiles or two different browsers also work.

## Test Setup Commands

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
npm run dev
```

Seed test users:

```bash
node database/create-2-test-users.cjs
node database/sync-clerk-test-users.cjs
```

## Scenarios

- First login shows password setup banner until password is set in Settings.
- Settings Security card supports first-time setup and password change.
- Mentor and mentee share the same topbar layout.
- Mentor can view the linked mentee.
- Mentee routes redirect away from mentor-only pages.
- Mentor routes redirect away from mentee-only pages.
- Non-provisioned Clerk email is blocked.
- Inactive DB user is blocked.
