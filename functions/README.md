# @corporate-blabla/functions

The Cloud Function proxy. The **only** thing the app calls, and the **only**
place the AI-provider API key, daily quota, and premium gating live.

## Callables

| Function | Input | Output |
| --- | --- | --- |
| `decode` | `{ text, locale, withDefense? }` | `{ result: DecoderResult, meta }` |
| `compose` | `{ intent, locale }` | `{ result: ComposerResult, meta }` |

## Other functions

| Function | Type | Role |
| --- | --- | --- |
| `revenuecatWebhook` | HTTP | RevenueCat → Firestore tier sync. The **only** writer of `users.tier`. Verifies the `Authorization` header against `REVENUECAT_WEBHOOK_AUTH`. |
| `reengageLapsed` | scheduled (daily 17:30 UTC) | Expo push to users with no open in 3+ days. Device-local commute reminders are scheduled on-device. |

Secrets used: `OPENAI_API_KEY`, `REVENUECAT_WEBHOOK_AUTH`.

`meta` = `{ tier, remaining: { decode, compose }, locked? }`.
The client uses `remaining` for the quota UI and `locked` to show premium
tones behind a paywall overlay.

Both are Firebase v2 **callable** functions — the app uses the Firebase SDK
`httpsCallable`, which passes the Anonymous Auth token automatically. No
unauthenticated access.

## Guarantees enforced here (never on the client)

- **API key isolation** — `OPENAI_API_KEY` is a Firebase secret, read only
  inside the handler via `.value()`.
- **Daily quota** — free users get `FREE_LIMITS` calls/day per action,
  enforced in a Firestore transaction so concurrent calls can't overspend.
- **Premium gating** — `surgical` + `boss` tones and the Decoder `defense`
  field are premium. Free `compose` still generates all four tones, then
  masks the premium ones and returns `locked: [...]` so the UI can show them
  locked (this drives conversion).
- **Input cap** — `MAX_INPUT` chars.

## Tier source of truth

`users/{uid}.tier` (`'free' | 'premium'`) decides everything. It is set by the
RevenueCat webhook (added in a later step). Missing docs default to free.

## Model reliability

`generateJSON` uses a provider-neutral adapter and OpenAI strict JSON Schema
output. Output is validated against the `core` contracts before returning.

## Build & deploy

`@corporate-blabla/core` is inlined at build time by esbuild (see `build.mjs`),
which avoids the monorepo `file:` dependency problem on Firebase deploy. The
heavy SDKs stay external and install normally in the cloud.

```bash
# one-time: store the key
firebase functions:secrets:set OPENAI_API_KEY

npm install
npm run build      # bundles src + core -> lib/index.js
npm run deploy     # firebase deploy --only functions
```

Deploy region defaults to `europe-west1` (close to Istanbul). A US region can
be added later for the English market.
