# Corporate BlaBla Decoder — launch readiness

Updated: 20 August 2026

## What is now in the codebase

- The missing mobile library layer has been rebuilt: Firebase anonymous
  authentication, callable-function API boundary, on-device history/personas,
  localisation, purchases, notification scheduling, analytics/crash seams and
  user preferences.
- The AI layer is now a server-side, provider-neutral generation boundary.
  OpenAI is the active launch adapter, using GPT-5.6 Luna, low reasoning and
  strict JSON Schema. Prompts and result contracts remain owned by the product,
  rather than by a vendor SDK.
- Free quota is a shared server-enforced limit of 3 AI actions/day. Failed model
  calls refund the consumed action.
- Account deletion is server-side and also clears the device-only history and
  personas. RevenueCat webhook processing now has constant-time authentication
  comparison and replay/event deduplication.
- The admin console has service-side Firebase access, signed administrator
  sessions and authorization enforced inside the card-writing server action.
- A core-contract test suite and GitHub Actions verification workflow are added.
- Legal privacy pages, README and release checklist now describe OpenAI rather
  than the previous provider.

## Validation evidence

| Check | Result |
| --- | --- |
| All workspace TypeScript checks | Passed |
| Admin production build | Passed (Next.js 15.5.19) |
| Expo configuration parsing | Passed |
| Expo Doctor | 17/18 checks passed after Metro/React deduplication; final dependency-version check cannot run in this Codex sandbox because Expo cannot write its normal user cache |
| Functions bundle | Blocked in this Codex Windows sandbox: the native esbuild process is denied directory traversal. The same command is included in GitHub Actions on Ubuntu/Node 20. |
| Core test runner | Blocked in this sandbox: tsx fails in Node os.userInfo() with uv_os_get_passwd ENOMEM. The test is included in CI on Node 20. |

The two blocked commands are environment failures, not TypeScript or application
errors. They must still be observed green in GitHub Actions before release.

## Release gates that need real accounts/devices

1. Set Firebase, OpenAI, RevenueCat and admin secrets; replace the EAS project
   placeholder and configure iOS/Android signing.
2. Deploy Firestore rules/indexes, Functions and Hosting. Configure the
   RevenueCat webhook with its Authorization secret.
3. Configure native Firebase App Check (App Attest/DeviceCheck and Play
   Integrity), verify calls on real devices, then set ENFORCE_APP_CHECK=true
   for Functions.
4. Perform the sandbox purchase, restore, delete-account, notification and
   share-card smoke tests in docs/submission-checklist.md.
5. Resolve the remaining production dependency audit before submission:
   npm audit --omit=dev reports 38 findings (21 moderate, 16 high, 1
   critical). Do not apply --force blindly because Expo/React Native upgrades
   require compatibility testing.
6. Have the Turkish privacy/KVKK and subscription copy reviewed by counsel,
   then complete Apple App Privacy and Google Data Safety forms from the actual
   deployed configuration.

## Launch decision

The source is now a coherent, type-safe release candidate with a documented
OpenAI-first gateway and freemium controls. It is **not honestly store-ready
until the six gates above are completed**, particularly device smoke testing,
App Check and dependency remediation. No source code can substitute for those
account- and device-bound validations.
