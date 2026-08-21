# @corporate-blabla/mobile

Expo SDK 54 app. Expo Router (4 tabs), the Reanimated **Tone Dial**, and the
`react-native-view-shot` share-card renderer. Talks to the backend only through
the Cloud Function proxy.

## Structure

```
app/                     expo-router routes
  _layout.tsx            gesture root + safe area + anon sign-in
  (tabs)/_layout.tsx     4 tabs: Günlük / Decoder / Composer / Profil
  (tabs)/index.tsx       Daily Plaza (streak, trap, social proof, share)
  (tabs)/decoder.tsx     paste -> translation + meter + trap chips + share
  (tabs)/composer.tsx    intent -> Tone Dial -> output + paywall + share
  (tabs)/profile.tsx     premium status (RevenueCat wired in step 4)
src/
  theme.ts               brand tokens (paper/ink/stamp red), light+dark
  lib/firebase.ts        Firebase JS SDK + Anonymous Auth (Expo Go OK)
  lib/api.ts             typed decode()/compose() over the proxy
  components/ToneDial    the signature draggable, snapping, haptic dial
  components/ShareCard   the always-paper viral artifact + capture helper
```

## Setup

```bash
# from the monorepo root
npm install

cd apps/mobile
# pin native deps to the exact SDK 54 versions:
npx expo install

cp .env.example .env   # fill in Firebase web config
```

## Run

```bash
npm run start:go     # Expo Go — dial, decoder, composer all work
npm run start        # dev client — required for share capture & RevenueCat
```

## Important: Expo Go vs dev build

Expo Go runs the core experience (navigation, the Tone Dial, Firebase calls).
But **share-card capture** (`react-native-view-shot`) and, later, **RevenueCat**
need a development build. Use `npx expo run:ios` / `run:android` or an EAS dev
build for those. The Firebase JS SDK was chosen specifically so auth + the
proxy calls work in Expo Go without native config.

## Notes

- Native versions in `package.json` are approximate — `npx expo install` aligns
  them to SDK 54 exactly. Reanimated 4 uses the `react-native-worklets/plugin`
  (already set in `babel.config.js`).
- The Daily Plaza screen uses a placeholder card until the content pipeline
  (step 5) writes daily cards to Firestore.
- Custom fonts (Fraunces serif / Inter) are referenced in `theme.ts`; wire them
  via `expo-font` in `_layout.tsx`, or they fall back to system fonts.
