# @corporate-blabla/core

The soul of the product, in code form. Everything else — the Cloud Function
proxy, the mobile app — imports from here. Stack-agnostic, no Firebase, no
React Native: just the IP.

## What's inside

| File | Role |
| --- | --- |
| `src/types.ts` | The strict output contracts (`DecoderResult`, `ComposerResult`) shared by the proxy and the app. Object **keys** are English; **values** are localized. |
| `src/tones.ts` | The four-tone dial definitions (`kind / distant / surgical / boss`) and the meter-band calibration. This is where the personality lives. |
| `src/fewshot/*` | Hand-curated golden examples — TR and EN, for Decoder and Composer. **This is the moat.** The model is the same for everyone; the voice is in these files. |
| `src/prompts/decoder.ts` | Builds the Decoder system prompt: strict JSON, meter calibration, few-shot injection. |
| `src/prompts/composer.ts` | Builds the Composer system prompt: all four tones in one call. |

## How a request flows

```
client text ─▶ Cloud Function proxy
                 │  builds system prompt via buildDecoderSystemPrompt(locale)
                 │  calls the server-side AI gateway with strict JSON output
                 ▼
            strict JSON ─▶ parsed against DecoderResult ─▶ client renders gauge + chips
```

The Composer returns **all four tone variants in a single call**, so the dial
slides instantly with zero extra latency or cost.

## Retuning the voice

- **More brutal / more measured overall:** shift the thresholds in
  `meterBand()` (`src/tones.ts`).
- **Change a tone's character:** edit its `direction` string in `TONES`. That
  text is injected verbatim into the Composer prompt.
- **Sharpen the voice:** add or replace examples in `src/fewshot/`. Keep
  translations short and scalpel-like; humor must come from accuracy, not
  exaggeration. Aim for ~10-12 examples per set — enough to anchor, not so
  many that they bloat the prompt.

## Localization

`tr` and `en` are first-class and independently curated — the EN sets are
**transcreated**, not translated (English corporate passive-aggression has its
own canon: "per my last email", "for visibility", "bandwidth"). To add a
locale, extend `Locale`, add `label`/`direction` entries to every tone, and
create matching few-shot files.

## Premium gating

`surgical` and `boss` tones, and the Decoder `defense` field, are premium. The
**proxy** enforces this (it controls which tones it asks for and whether it
passes `withDefense`). Never trust the client for gating.
