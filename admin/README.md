# @corporate-blabla/admin

Next.js (App Router) admin console for content moderation and metrics. Runs
server-side with the Firebase Admin SDK, so it reads/writes Firestore directly
and bypasses the client security rules.

## Features

- **Dashboard** — total users, premium count + conversion %, active today, and
  today's Plaza opens.
- **Plaza** — list upcoming cards; open any date to create/edit a card. The
  editor validates payloads against `@corporate-blabla/core` (`isValidPayload`)
  before writing, for both tr and en, so a malformed card can't reach the app.
- **Users** — recent activity (tier, streak, last seen). UIDs are anonymous.

## Auth

A single shared password gate. `login` checks `ADMIN_PASSWORD` and sets a signed
(HMAC) httpOnly session cookie; every protected route runs `requireAdmin()` in a
server component. Set a strong `ADMIN_SESSION_SECRET`.

## Setup

```bash
npm install
cp .env.example .env     # service account + ADMIN_PASSWORD + ADMIN_SESSION_SECRET
npm run dev              # http://localhost:3001
```

Provide credentials either as `FIREBASE_SERVICE_ACCOUNT` (JSON string) or
`GOOGLE_APPLICATION_CREDENTIALS` (path to the service-account file).

## Notes

- Runs entirely on the server; deploy somewhere that supports Node (Vercel,
  Cloud Run). Keep it private — it has full Firestore access.
- Bulk content generation still lives in `content-pipeline`; this panel is for
  spot edits and moderation of individual cards.
