import type { ToneDef, ToneId, MeterBand, Locale } from './types';

/**
 * The four tones of the Ton Kadanı.
 *
 * `direction` is the heart of the Composer IP: each string tells the model
 * exactly how this tone behaves, including its signature tells (emoji use,
 * sentence length, what it hides). Tweak these to retune the product's voice.
 *
 * Calibration intent:
 *  - kind     → warm, generous, slightly over-friendly. Uses 🙂. Longest.
 *  - distant  → neutral, procedural, HR-safe. No emoji. Medium.
 *  - surgical → polite words wrapped around a blade. May use 🙂 as a threat.
 *  - boss     → short, imperative, no cushioning. Shortest.
 */
export const TONES: Record<ToneId, ToneDef> = {
  kind: {
    id: 'kind',
    order: 0,
    label: { tr: 'Nazik', en: 'Kind' },
    premium: false,
    direction: {
      tr:
        'Sıcak, cömert, hafifçe fazla dostane. İltifatla başlar, "buradayım / takılırsan yaz" gibi destek cümleleriyle biter. ' +
        'Genelde bir 🙂 kullanır. En uzun ton. Çatışmayı tamamen yastıklar; istek bir ricaymış gibi durur.',
      en:
        'Warm, generous, slightly over-friendly. Opens with a compliment, closes with a supportive line like ' +
        '"I\'m here / shout if you get stuck". Usually uses one 🙂. The longest variant. Fully cushions any conflict so the ask reads as a favor.',
    },
  },
  distant: {
    id: 'distant',
    order: 1,
    label: { tr: 'Profesyonel-mesafeli', en: 'Professional-distant' },
    premium: false,
    direction: {
      tr:
        'Nötr, prosedürel, İK-güvenli. Duygu yok, süs yok, emoji yok. Net ve kısa cümleler. ' +
        '"Teyit eder misin? / bekleniyor" gibi kurumsal-tarafsız bir ses. Ne sıcak ne agresif; mesafeli ve profesyonel.',
      en:
        'Neutral, procedural, HR-safe. No emotion, no decoration, no emoji. Clear short sentences. ' +
        'A corporate-neutral voice like "Can you confirm? / is expected". Neither warm nor aggressive — distant and professional.',
    },
  },
  surgical: {
    id: 'surgical',
    order: 2,
    label: { tr: 'Cerrahi pasif-agresif', en: 'Surgical passive-aggressive' },
    premium: true,
    direction: {
      tr:
        'Kibar kelimelerin içine gizlenmiş bir bıçak. Yüzeyde nazik, altında keskin. ' +
        '"Yanlış hatırlamıyorsam / tabii yanılıyorsam loop\'a alabiliriz" gibi nazik tehditler kurar. ' +
        'Çoğunlukla bir 🙂 ile biter — ama bu gülümseme bir uyarıdır, süs değil. Asla bağırmaz; iğneler.',
      en:
        'A blade hidden inside polite words. Friendly on the surface, sharp underneath. ' +
        'Builds gentle threats like "unless I\'m misremembering / happy to loop in [Manager] to clarify". ' +
        'Often ends with a 🙂 — but the smile is a warning, not decoration. Never shouts; it needles.',
    },
  },
  boss: {
    id: 'boss',
    order: 3,
    label: { tr: 'Patron modu', en: 'Boss mode' },
    premium: true,
    direction: {
      tr:
        'Kısa, emir kipli, yastıksız. Selamlaşma minimum ya da yok. Net bir talep + net bir son tarih (EOD, cuma). ' +
        'En kısa ton. Açıklama yapmaz, rica etmez, gerekçe sunmaz. Otorite konuşur.',
      en:
        'Short, imperative, uncushioned. Greeting minimal or absent. A clear ask + a clear deadline (EOD, Friday). ' +
        'The shortest variant. No explaining, no asking, no justifying. Authority speaks.',
    },
  },
};

export const TONE_LIST: ToneDef[] = Object.values(TONES).sort(
  (a, b) => a.order - b.order
);

/** Tones available to free users. */
export const FREE_TONES: ToneId[] = TONE_LIST.filter((t) => !t.premium).map(
  (t) => t.id
);

/** Localized dial label. */
export function toneLabel(id: ToneId, locale: Locale): string {
  return TONES[id].label[locale];
}

/* ------------------------------------------------------------------ */
/* Meter band                                                          */
/* ------------------------------------------------------------------ */

/**
 * Map a 0–100 passive-aggressiveness score to its band. Drives the gauge
 * color and the band label. This is the product's "humor scale" — shift the
 * thresholds to make the whole app more brutal or more measured.
 *
 *   0–30   innocent  (masum)
 *   31–60  sneaky    (sinsi)
 *   61–85  evidence  (kanıt bırakan)
 *   86–100 nuclear   (loop'a alan / nükleer)
 */
export function meterBand(meter: number): MeterBand {
  if (meter <= 30) return 'innocent';
  if (meter <= 60) return 'sneaky';
  if (meter <= 85) return 'evidence';
  return 'nuclear';
}

export const METER_BAND_LABEL: Record<MeterBand, Record<Locale, string>> = {
  innocent: { tr: 'Masum', en: 'Innocent' },
  sneaky: { tr: 'Sinsi', en: 'Sneaky' },
  evidence: { tr: 'Kanıt bırakıyor', en: 'Building a case' },
  nuclear: { tr: "Loop'a aldı", en: 'Went nuclear' },
};
