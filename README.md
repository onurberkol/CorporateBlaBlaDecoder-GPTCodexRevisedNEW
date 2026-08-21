# Corporate BlaBla Decoder

> Decode passive-aggressive corporate messages into the blunt truth — and rewrite
> your own in any tone, from **Kind** to **Boss mode**. A commuter-first mobile app
> whose share cards are built to go viral in the office group chat.

- **TR store name:** Corporate BlaBla Decoder
- **US store name (localized):** Per My Last Email
- **Owner:** Odit Teknoloji ve İletişim Hizmetleri Ticaret A.Ş. (İstanbul)

This repository is the complete, GitHub-ready package: source code, architecture,
Firestore rules, the admin panel, the content pipeline, the marketing/legal web
pages, the design assets, and two full deliverable documents (product + technical).

---

## What's in here

| Path | What it is |
| --- | --- |
| `packages/core/` | **The IP.** Tone definitions, TR/EN few-shot libraries, strict-JSON prompt builders, shared types. Stack-agnostic — no Firebase, no React Native. |
| `functions/` | Firebase Functions v2 **provider-neutral AI gateway.** OpenAI is the launch provider; it holds the key, enforces quota + premium gating, and synchronizes RevenueCat tier state. |
| `apps/mobile/` | **Expo SDK 54** app. Expo Router (4 tabs), the Reanimated Tone Dial, the `react-native-view-shot` share-card renderer, anonymous auth, on-device privacy for sensitive data. |
| `content-pipeline/` | tsx CLI that batch-generates Daily Plaza cards with the same governed AI gateway contract and writes them to Firestore. |
| `web/` | Firebase Hosting: landing page + locale-aware legal pages (EN privacy/terms, TR KVKK/kullanım). |
| `admin/` | **Next.js 15** admin console. Server-side Firebase Admin SDK, HMAC cookie auth, Plaza editor, metrics. |
| `firestore.rules` · `firestore.indexes.json` · `firebase.json` | Security rules (server-only `tier`/`usage`), indexes, deploy config. |
| `docs/` | Deliverable documents (product + technical PDFs), design assets, schema/ASO/submission/infrastructure notes. See `docs/README.md`. |

## Architecture invariant (read this first)

> **(1)** The AI-provider API key is **never** on the client — only in the Cloud Function
> proxy. **(2)** `users.tier` (the premium source of truth) is written **only** by the
> RevenueCat webhook. **(3)** Quota and premium gating are enforced **only** on the
> server; `firestore.rules` stops clients from touching `tier`/`usage`.

Data flow: `mobile (anon auth) -> App Check -> Cloud Function gateway (key + quota + gating) -> OpenAI -> strict JSON -> client`.
Full reasoning, threat model, and per-module code walkthrough are in the **Technical Document** (`docs/deliverables/`).

## Monorepo & tooling

npm workspaces (`packages/*`, `apps/*`, `admin`). The functions package bundles
`@corporate-blabla/core` inline via esbuild at predeploy time (Firebase only ships
the `functions/` folder), so **after editing `core`, rebuild functions before deploy**.

## Quickstart (developers)

```bash
# 1) Install (from repo root)
npm install

# 2) Fill environment from the .env.example files
cp functions/.env.example functions/.env
cp apps/mobile/.env.example apps/mobile/.env        # Firebase web config
cp admin/.env.example admin/.env
cp content-pipeline/.env.example content-pipeline/.env

# 3) Core (the IP) — typecheck
npm --prefix packages/core run typecheck

# 4) Mobile — align native deps to the exact SDK 54 versions, then run
cd apps/mobile && npx expo install
npm run start:go        # Expo Go: dial, decoder, composer, navigation
npm run start           # dev client: required for share-capture & RevenueCat

# 5) Backend — deploy functions, rules, indexes, hosting
firebase deploy

# 6) Admin (port 3001)
cd admin && npm run dev
```

## Secrets & configuration (set before going live)

| Where | Key |
| --- | --- |
| Firebase Functions secret | `OPENAI_API_KEY`, `REVENUECAT_WEBHOOK_AUTH` |
| Admin env | `ADMIN_SESSION_SECRET` |
| Mobile env | Firebase web config; EAS `projectId` in `apps/mobile/app.json` |
| `apps/mobile/eas.json` | Apple/Play identifiers (replace the `REPLACE_*` placeholders) |
| RevenueCat | `premium` entitlement + offering; webhook to proxy URL with `Authorization` = secret; `appUserID` = Firebase uid |

A full deploy/handoff checklist lives in `docs/submission-checklist.md` and the
**Technical Document**.

## Status

TypeScript checks and the admin production build are verified. A real-device
dev-build smoke test, production secrets/identifiers, App Check configuration,
and legal review remain mandatory before a store submission; see
`docs/submission-checklist.md`.

## License

Proprietary. (c) Odit Teknoloji ve İletişim Hizmetleri Ticaret A.Ş. All rights reserved.
