# @corporate-blabla/content-pipeline

Batch-generates the Daily Plaza ritual cards with OpenAI and writes them to
Firestore (`dailyPlaza/{YYYY-MM-DD}`). Runs offline/occasionally — never in the
app or the request path, so cost and consistency stay controlled (same approach
as prior content pipelines).

## Formats

Cards rotate through four formats (`trap → riddle → horoscope → bingo`), each
produced in **both** tr and en (transcreated, not translated). The contract and
validators live in `@corporate-blabla/core` (`plaza.ts`), so the app and the
pipeline can never drift.

## Usage

```bash
npm install
cp .env.example .env   # add OPENAI_API_KEY

# dry run -> out/plaza.json (review before publishing)
npm run generate -- --start=2026-07-01 --days=30

# publish straight to Firestore (needs GOOGLE_APPLICATION_CREDENTIALS)
npm run generate:firestore -- --start=2026-07-01 --days=30
```

Flags: `--start=YYYY-MM-DD` (default today UTC), `--days=N` (default 30),
`--out=json|firestore`, `--file=path` (json output path).

## How it stays on-voice

`src/prompts.ts` injects the brand voice (humor from accuracy, scalpel-short)
plus per-format specs and examples. The generator validates every payload with
`isValidPayload` for both locales and retries once on a miss, so malformed cards
never reach Firestore. An anti-repeat list keeps a 30-day batch varied.

## Recommended cadence

Run monthly to top up ~30 days ahead. The app reads `dailyPlaza/{today}` and
falls back to a built-in card if a day is missing, so a missed run never leaves
the screen empty.
