# Store Assets — Corporate BlaBla Decoder / Per My Last Email

Submission-ready marketing assets for the **Apple App Store** and **Google Play**,
for both markets (TR: *Corporate BlaBla Decoder* · US: *Per My Last Email*).

Everything here was rendered from the product's real design system (the same
paper / ink / stamp-red language used in the app and the documents), at exact
store dimensions, so you can upload directly.

## Contents

```
store-assets/
├── listing/
│   ├── app-store-US.md          App Store Connect fields (Per My Last Email)
│   ├── app-store-TR.md          App Store Connect fields (Corporate BlaBla Decoder)
│   ├── google-play-US.md        Play Console fields (en-US)
│   └── google-play-TR.md        Play Console fields (tr-TR)
├── icon/
│   └── icon-1024.png            App icon, 1024×1024 (master)
├── feature-graphic/
│   ├── google-play-feature-1024x500-tr.png
│   └── google-play-feature-1024x500-en.png
└── screenshots/
    ├── ios-6.7/tr/  01..05      1290×2796  (iPhone 6.7")
    ├── ios-6.7/en/  01..05      1290×2796
    ├── android/tr/  01..05      1080×2160  (2:1, Play-safe)
    └── android/en/  01..05      1080×2160
```

## Screenshot set (order matters in the stores)

| # | Screen | Headline (TR) | Headline (EN) |
| --- | --- | --- | --- |
| 01 | Daily Plaza | Her sabah, yeni bir plaza tuzağı. | A new office trap. Every morning. |
| 02 | Decoder | O mail aslında ne diyor? | What that email actually means. |
| 03 | Tone Dial | Nazik'ten Patron'a, tek kaydırışta. | Kind to Boss. One swipe. |
| 04 | Share card | Grup sohbetine hazır. | Made for the group chat. |
| 05 | Corner Office | Köşe Ofis: sınırsız, tüm tonlar. | Corner Office: unlimited. |

## Dimensions reference

| Asset | Size | Store rule |
| --- | --- | --- |
| App icon (master) | 1024×1024 | App Store wants 1024; Play wants 512 — downscale the master for Play. |
| Feature graphic | 1024×500 | Google Play only. |
| iOS screenshots | 1290×2796 | Apple required 6.7" size. Reuse for 6.5" by scaling to 1284×2778. |
| Android screenshots | 1080×2160 | Play phone, 2:1 (within the 16:9–2:1 range). Min 2, max 8. |

## Honest notes for the person submitting

- These are **high-fidelity marketing mockups** rendered from the app's actual
  design system at exact store sizes — ready to upload. If you prefer, you can
  *also* capture live screenshots from the built app once it runs on a device and
  drop them into the same frames; the captions and order above still apply.
- **iPad / 6.5":** not generated here. Add them only if you support those devices.
  6.5" = scale the 6.7" set to 1284×2778. iPad needs its own 2048×2732 set.
- **Play icon:** Google Play wants a 512×512 icon — just downscale `icon/icon-1024.png`.
- **URLs** in the listing files use `corporateblabla.app/...` placeholders — point
  them at your live pages (the legal pages ship in the repo under `web/`).
- **Localized names:** the binary is one app; only the store-side name/metadata
  differ per region (TR vs US). Don't rename the bundle id.
- The copy respects each field's character limit, but re-check after any edits.
