# Documentation

Everything that explains the product and the system, in one place.

## Deliverables (`deliverables/`)

| File | What it covers |
| --- | --- |
| `CorporateBlaBlaDecoder-Urun-Dokumani.pdf` | **Product Document (TR).** The origin story (white-collar commuter insight, the "Beyza" persona, why time-optimization is the least viral need, the corporate-frustration fuel, plaza dili, the privacy tension and its two-mode solution), every module explained with screenshots and usage, the four-legged retention model, the design language, the full usage flow, free/premium split, and the growth loop. |
| `CorporateBlaBlaDecoder-Teknik-Dokumani.pdf` | **Technical Document (TR).** A developer handoff: the build journey and every decision, the architecture invariant + threat model, the monorepo/build topology, and a per-module code walkthrough (core, functions, Firestore rules, mobile, content-pipeline, admin) with real code excerpts, plus the deploy/handoff checklist, quality results, and a "retune the voice" operations guide. |

## Engineering notes

| File | What it covers |
| --- | --- |
| `firestore-schema.md` | Collections, fields, who writes what, and the server-only constraints. |
| `infrastructure.md` | How to wire App Check, PostHog (analytics), and Sentry (crash) — one-line seams already in the app. |
| `store-metadata.md` | ASO copy for both markets (TR: Corporate BlaBla Decoder, US: Per My Last Email). |
| `submission-checklist.md` | The step-by-step store submission + go-live checklist. |

## Design (`design/`)

| File | What it is |
| --- | --- |
| `screens-gallery.html` | Standalone HTML gallery of the app's phone mockups (paper / ink / stamp-red editorial design, light + dark). Open in any browser. |
| `sources/` | The HTML/CSS sources used to render the two PDF deliverables (`style.css`, `product-body.html`, `technical-body.html`, `technical-body2.html`). The PDFs were produced from these with `wkhtmltopdf`. |

### Rebuilding the PDFs from source

```bash
cd docs/design/sources
# Product
{ echo '<!doctype html><html lang="tr"><head><meta charset="utf-8"><style>';   cat style.css; echo '</style></head><body>'; cat product-body.html; echo '</body></html>'; } > product.html
wkhtmltopdf --enable-local-file-access --encoding utf-8 product.html ../../deliverables/CorporateBlaBlaDecoder-Urun-Dokumani.pdf
# Technical
{ echo '<!doctype html><html lang="tr"><head><meta charset="utf-8"><style>'; cat style.css; echo '</style></head><body>'; cat technical-body.html technical-body2.html; echo '</body></html>'; } > technical.html
wkhtmltopdf --enable-local-file-access --encoding utf-8 technical.html ../../deliverables/CorporateBlaBlaDecoder-Teknik-Dokumani.pdf
```
