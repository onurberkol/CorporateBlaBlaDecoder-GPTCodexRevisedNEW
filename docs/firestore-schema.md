# Firestore schema

## `users/{uid}`

One doc per anonymous user. `uid` is the Firebase Anonymous Auth uid, which is
also the RevenueCat `appUserID`.

| Field | Type | Written by | Notes |
| --- | --- | --- | --- |
| `tier` | `'free' \| 'premium'` | **server only** (RevenueCat webhook) | The single source of truth for entitlement. The proxy trusts this. |
| `premiumUntil` | number (ms) | server | Entitlement expiry, for reference/defense. |
| `usage` | `{ date, decode, compose }` | **server only** (proxy) | Daily quota counters, reset on date change. |
| `prefs` | `{ commuteMorning, commuteEvening, notifications }` | client | Commute times (HH:mm) + notif toggles. |
| `streak` | `{ count, lastDay }` | client | Daily Plaza streak. |
| `pushToken` | string | client | Expo push token for re-engagement pushes. |
| `onboardingDone` | boolean | client | Gates the onboarding flow. |
| `displayLocale` | `'tr' \| 'en'` | client | Optional override of device locale. |
| `lastSeen` | timestamp | server | Updated by the proxy on each call. |

Security: clients may only write `prefs`, `pushToken`, `onboardingDone`,
`displayLocale`, `streak`, `updatedAt` (see `firestore.rules`). `tier` and
`usage` are Admin-SDK-only.

## `dailyPlaza/{day}`

`day` = `YYYY-MM-DD`. One ritual card per day, written by the content pipeline
(step 5). Read by any signed-in user.

```
{
  date: '2026-06-24',
  format: 'trap' | 'horoscope' | 'bingo' | 'riddle',
  locale: { tr: {...}, en: {...} }   // localized card payloads
}
```

## `plazaStats/{day}`

Aggregate "you're not alone" counter shown under the daily card.

```
{ date: '2026-06-24', count: 14302 }
```

Incremented server-side (a callable or the proxy) when a user opens the day's
card. Never written by clients directly.
