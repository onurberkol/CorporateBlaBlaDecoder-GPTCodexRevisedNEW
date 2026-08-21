# Corporate BlaBla Decoder - UI design system

## Creative direction

The product is an **editorial office toolkit**, not a generic AI chat product.
Its signature is a small set of tactile, repeatable motifs:

- warm document paper (#F4F1EA) and cream surfaces (#FBFAF6);
- black ink (#221F1B) for decisions and primary actions;
- stamp red (#BC3B2E) for urgency, proof and premium moments;
- Fraunces for editorial statements, Inter for utility and controls;
- small document corners, thin ruled dividers and rotated stamp details.

Avoid gradients, glass effects, rounded SaaS-card stacks, emoji in primary
controls, dense headers, fake productivity metrics and generic AI sparkle icons.

## Tokens

| Role | Token/value | Usage |
| --- | --- | --- |
| Canvas | bg / #F4F1EA | All paper surfaces |
| Card | card / #FBFAF6 | Results, daily cards, forms |
| Ink | textStrong / #1A1714 | Primary copy and black CTA |
| Stamp | accent / #BC3B2E | Result proof, premium, secondary CTA |
| Rule | line / #DDD4C3 | Dividers and document outlines |
| Serif | Fraunces 600 | Headings, decoded truth, daily-card titles |
| Sans | Inter 400/500 | Inputs, labels, actions, metadata |

The implementation lives in apps/mobile/src/theme.ts and the shared component
family is apps/mobile/src/components/ui.tsx.

## Screen inventory

| Route | Primary job | Required visual treatment |
| --- | --- | --- |
| Onboarding | Establish safe, witty value proposition | Paper canvas, large serif promise, one decisive black CTA per step |
| Daily Plaza | Create daily ritual and sharing loop | Date/rule line, editorial daily card, stamp, simple streak |
| Decoder | Turn ambiguity into an answer | Document-like input, black Decode CTA, stamped translation card, red meter |
| Composer | Turn intent into controlled reply | Intent document, tactile tone control, selected tone answer on paper |
| Paywall | Explain premium without pressure | Red/ink contrast, restrained benefits, native-store price only |
| Archive | Review past results | Chronological document list, thin rules, no dashboard cards |
| Personas | Save writing context | Small document cards and clear privacy copy |
| Report | Reveal useful weekly pattern | Ink-first type, one data story at a time |
| Profile | Preferences and account control | Settings as an editorial list, separated by rules |

## Interaction rules

- Primary task buttons are black; sharing and premium emphasis use stamp red.
- All controls keep a minimum 50px touch target.
- A selected item uses ink/red contrast, never colour alone.
- Motion is limited to 140-180ms, light haptic confirmation on tone changes,
  and must respect reduced-motion settings when native support is added.
- Results should arrive as a single stable document card; avoid chat bubbles.
- Locked premium content reveals value but never shows a fabricated preview.

## Design source files

The three high-fidelity visual direction references are in
docs/design/ui-concepts-2026:

1. 01-decoder-concept-filled.png — gerçekçi mesaj, çözüm ve pasif-agresiflik göstergesi içeren Decoder ana ekranı
2. 02-composer-concept.png
3. 03-daily-plaza-concept.png

They are concept references for hierarchy, texture and interaction language.
Production store screenshots must continue to be captured from the real app,
not exported from these concepts.
