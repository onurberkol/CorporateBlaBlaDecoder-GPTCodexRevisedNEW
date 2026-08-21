# Submission checklist

Everything needed to go from this repo to “in review”, in order.

## 1. Fill in real values (replace placeholders)

| Where | Placeholder | Value |
| --- | --- | --- |
| `apps/mobile/.env` | `EXPO_PUBLIC_FIREBASE_*` | Firebase web config |
| `apps/mobile/.env` | `EXPO_PUBLIC_RC_IOS/ANDROID` | RevenueCat public SDK keys |
| `apps/mobile/app.json` | `extra.eas.projectId` | EAS project id (`eas init`) |
| `apps/mobile/eas.json` | Apple/Play ids | App Store Connect + Play service account |
| `functions` secrets | `OPENAI_API_KEY`, `REVENUECAT_WEBHOOK_AUTH` | `firebase functions:secrets:set …` |

## 2. Backend deploy

```bash
firebase deploy --only firestore:rules,firestore:indexes
firebase deploy --only functions
firebase deploy --only hosting        # legal pages at corporateblabla.app
```
- Custom domain `corporateblabla.app` connected in Firebase Hosting (or update the
  URLs in `profile.tsx` to the real domain).

## 3. RevenueCat

- Create entitlement `premium`.
- Create the subscription product(s) in App Store Connect and Play Console, add
  them to a RevenueCat **Offering** (the paywall reads `offerings.current`).
- Set the app’s RevenueCat `appUserID` = Firebase uid (already done in code).
- Point the RevenueCat **webhook** at the deployed `revenuecatWebhook` URL and set
  its Authorization header to `REVENUECAT_WEBHOOK_AUTH`.

## 4. Content

```bash
cd content-pipeline
npm run generate -- --days=45          # review out/plaza.json
npm run generate:firestore -- --days=45
```
Schedule monthly. The app falls back to a built-in card if a day is missing.

## 5. Build

```bash
cd apps/mobile
eas init
eas build --profile production --platform all
```

## 6. Apple — App Store Connect

- [ ] App record + bundle id `com.odit.corporateblabla`
- [ ] Localizations: English (US) → “Per My Last Email”, Turkish → “Corporate BlaBla Decoder”
- [ ] Subscription group + product; localized display name, price, description
- [ ] **Account deletion** — implemented in app (Profile → Delete account) ✅
- [ ] **Auto-renewable subscription disclosure** — present on paywall + in Terms ✅
- [ ] Privacy Policy URL: `https://corporateblabla.app/privacy`
- [ ] App Privacy answers: Identifiers (anonymous) + Usage Data + Purchases; **not** used for tracking; not linked to identity
- [ ] Export compliance: `ITSAppUsesNonExemptEncryption=false` set in app.json ✅
- [ ] No login required → add a review note: “App is anonymous; no demo account needed.”
- [ ] Screenshots (6) per device size, both languages
- [ ] `eas submit --profile production --platform ios`

## 7. Google — Play Console

- [ ] App + package `com.odit.corporateblabla`
- [ ] Store listing per language (EN + TR)
- [ ] Subscription product set up; matches RevenueCat
- [ ] **Data safety form**: collects anonymous identifier, app activity, purchases; encrypted in transit; deletion available
- [ ] Content rating questionnaire
- [ ] Privacy Policy URL
- [ ] Target API level satisfied by Expo SDK 54 / RN 0.81
- [ ] Internal testing track first → production
- [ ] `eas submit --profile production --platform android`

## 8. Pre-flight smoke test (dev build)

- [ ] Anonymous sign-in succeeds on cold start
- [ ] Decode + Compose return within quota; 4th call shows the free-limit message
- [ ] Tone Dial slides + haptics; locked tones open the paywall
- [ ] Purchase (sandbox) flips `users/{uid}.tier` → premium via webhook; tones unlock
- [ ] Restore purchases works
- [ ] Share card captures + opens the share sheet
- [ ] Notifications permission + a scheduled reminder fires at commute time
- [ ] Delete account removes the user doc and signs out
- [ ] Configure native Firebase App Check on iOS and Android, set `ENFORCE_APP_CHECK=true`, then re-run Decode and Compose on real devices

## Already handled in code

Account deletion · server-only tier/quota (Firestore rules) · API key isolation
(proxy) · subscription auto-renew copy · permission strings · adaptive icon +
splash + notification icon · clean legal URLs (locale-aware) · export-compliance flag.
