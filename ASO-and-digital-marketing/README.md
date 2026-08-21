# Marketing — Corporate BlaBla Decoder / Per My Last Email

Three deliverables for launch and growth.

## Contents

```
Marketing/
├── ASO-Strategy.md                 Comprehensive App Store Optimization playbook
├── Digital-Marketing-Strategy.md   Multi-channel growth & paid strategy
└── landing-page/
    ├── index.html                  SEO-optimized, self-contained landing page
    └── og-image.png                1200×630 social share image (referenced in <meta>)
```

## 1. ASO-Strategy.md
Field-by-field keyword optimization for **both stores and both markets** (App Store + Google
Play, TR + US), conversion (icon/screenshots/preview) guidance, ratings strategy, Apple Search
Ads, A/B testing plan, measurement cadence, and a 90-day roadmap. Pairs with the ready-to-upload
assets in the separate `store-assets` package.

## 2. Digital-Marketing-Strategy.md
The growth thesis ("the product's output is the ad"), positioning & voice, personas, a
channel-by-channel plan (TikTok, Instagram, LinkedIn, Facebook, X/Reddit, YouTube Shorts),
the content engine & pillars, paid acquisition mix + budget scenarios, creator strategy, a
phased launch plan, lifecycle/CRM, full measurement/KPIs, and a hook bank to steal.

## 3. landing-page/
A single self-contained `index.html` — no build step, no external dependencies. Open it in a
browser or drop it onto any host (it slots straight into the repo's `web/` folder).

**SEO built in:**
- Optimized `<title>` + meta description + keywords, canonical, robots.
- `hreflang` for the two markets (TR + EN), `x-default`.
- Open Graph + Twitter Card (uses `og-image.png`).
- JSON-LD structured data: `SoftwareApplication` + `FAQPage` (FAQ rich-result eligible).
- Semantic HTML5, heading hierarchy, accessible labels, mobile-first responsive.
- On-brand design (paper / ink / stamp-red) with inline phone mockups — fast, crisp, image-light.

### Before you publish
- Swap the placeholder store links (`href="#"`) for your real App Store / Google Play URLs,
  and replace the text badges with the official "Download on the App Store" / "Get it on
  Google Play" badge artwork (store branding guidelines require the official lockups).
- Point the legal footer links at your live `gizlilik.html` / `kullanim.html` (they ship in
  the repo's `web/` folder) and host `og-image.png` at the same path used in the meta tag.
- Update the JSON-LD `aggregateRating` once you have real ratings (remove it until then to
  avoid policy issues — fabricated ratings can be flagged).
- For the US site, clone the page, translate copy to English ("Per My Last Email"), and set
  `lang="en"` + the EN `og:locale`/canonical.

## Related packages
- **store-assets** — ready-to-upload icon, feature graphics, and captioned screenshots.
- **corporate-blabla-decoder** (repo) — full source, plus product & technical PDFs.
