# Infrastructure: App Check, Analytics, Crash reporting

The app ships with clean, provider-agnostic seams for all three. Nothing here
is required to run in Expo Go or to submit — these are switched on when you do a
dev/production build and connect providers. Each is non-breaking and off by
default.

---

## 1. App Check (abuse protection for callables)

Server side is already wired: `decode`, `compose`, and `openPlaza` read
`ENFORCE_APP_CHECK` (functions config) and pass it to `enforceAppCheck`. It is
**false by default** so calls keep working before clients send tokens.

To enable:
1. In a dev build, add native App Check (App Attest/DeviceCheck on iOS, Play
   Integrity on Android). With the JS SDK this means adding
   `@react-native-firebase/app-check` (or migrating Firebase calls to RN
   Firebase) and initializing it at startup.
2. Register your apps’ App Check providers in the Firebase console.
3. Set the Functions runtime environment variable to `ENFORCE_APP_CHECK=true`
   using the deployment configuration, then redeploy:
   ```bash
   firebase deploy --only functions
   ```
4. Verify a real client call still succeeds, then watch unverified traffic drop.

> Keep it false until step 1–2 are done, or every call will fail with
> `unauthenticated`.

---

## 2. Analytics (measure the viral loop)

`src/lib/analytics.ts` exposes `track(event, props?)` and is already called at
the funnel-critical points:

| Event | Where | Props |
| --- | --- | --- |
| `app_open` | app start | — |
| `plaza_open` | Plaza tab mount | — |
| `decode` | decode success | `meter`, `locale` |
| `compose` | compose success | `persona` (bool), `locale` |
| `share` | every share button | `surface` = decoder/composer/plaza/archive/report |
| `paywall_view` | paywall mount | — |
| `purchase` | purchase success | `pkg` |

This is exactly what you need for K-factor (`share` / active) and conversion
(`purchase` / `paywall_view`). Wire a provider once, e.g. **PostHog**:

```bash
npx expo install posthog-react-native
```
```ts
// e.g. at the top of app/_layout.tsx, inside RootLayout effect
import PostHog from 'posthog-react-native';
import { configureAnalytics } from '@/lib/analytics';

const posthog = new PostHog(process.env.EXPO_PUBLIC_POSTHOG_KEY!, {
  host: 'https://eu.posthog.com',
});
configureAnalytics((event, props) => posthog.capture(event, props));
```

Or Firebase Analytics via `@react-native-firebase/analytics` — the seam is the
same single `configureAnalytics(...)` call. Until then, events log to the dev
console only.

---

## 3. Crash reporting

`src/lib/crash.ts` exposes `captureError(...)` and `initCrash()`, and an
`ErrorBoundary` already wraps the app (so one bad screen can’t white-screen
everything; the error is forwarded to `captureError`).

Wire **Sentry**:
```bash
npx expo install @sentry/react-native
```
```ts
// src/lib/crash.ts → fill in initCrash()
import * as Sentry from '@sentry/react-native';
export function initCrash() {
  if (!process.env.EXPO_PUBLIC_SENTRY_DSN) return;
  Sentry.init({ dsn: process.env.EXPO_PUBLIC_SENTRY_DSN, tracesSampleRate: 0.2 });
  setCrashHandler((e, ctx) => Sentry.captureException(e, { extra: ctx }));
}
```
Add the Sentry Expo config plugin per their docs for native symbolication.
Until a DSN is set, `captureError` logs in dev and is a no-op in production.

---

## Environment summary

| Var | Used by | Default |
| --- | --- | --- |
| `ENFORCE_APP_CHECK` | functions | `false` |
| `EXPO_PUBLIC_POSTHOG_KEY` | analytics (when wired) | unset → console only |
| `EXPO_PUBLIC_SENTRY_DSN` | crash (when wired) | unset → no-op |
