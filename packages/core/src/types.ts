/**
 * Corporate BlaBla Decoder — core type contracts.
 *
 * These types are the single source of truth shared by the Cloud Function
 * proxy and the mobile app. The model is told to return JSON that matches
 * `DecoderResult` / `ComposerResult` exactly, and the app parses against the
 * same shapes. Object KEYS are always English (stable for code); VALUES are
 * localized to the user's `Locale`.
 */

export type Locale = 'tr' | 'en';

/**
 * The four tone stops on the Ton Kadanı (tone dial), in dial order.
 * `kind` is the left end, `boss` is the right end.
 */
export type ToneId = 'kind' | 'distant' | 'surgical' | 'boss';

export const TONE_ORDER: ToneId[] = ['kind', 'distant', 'surgical', 'boss'];

/* ------------------------------------------------------------------ */
/* Decoder                                                             */
/* ------------------------------------------------------------------ */

/**
 * A single decoded "trap": maps an original phrase to what it really means.
 * Rendered as a chip under the translation in the UI.
 */
export interface DecoderTrap {
  /** The original phrase, e.g. `"rica etsem"` or `"for visibility"`. */
  phrase: string;
  /** The blunt real meaning, e.g. `"emir"` or `"I'm reporting you"`. */
  meaning: string;
}

/**
 * Pasif-agresiflik (passive-aggressiveness) calibration bands.
 * Drives the gauge color + label. Derived from `meter` client-side via
 * `meterBand()` — never sent by the model.
 */
export type MeterBand = 'innocent' | 'sneaky' | 'evidence' | 'nuclear';

export interface DecoderResult {
  /** Blunt plain-language translation of what the message actually means. */
  translation: string;
  /** Passive-aggressiveness score, integer 0–100. */
  meter: number;
  /** 1–3 detected traps. */
  traps: DecoderTrap[];
  /**
   * Optional suggested reply (premium "savunma önerisi"). Omitted on the
   * free tier — the prompt only requests it when `withDefense` is true.
   */
  defense?: string;
}

/* ------------------------------------------------------------------ */
/* Composer                                                            */
/* ------------------------------------------------------------------ */

export interface ComposerResult {
  /**
   * The user's raw intent, lightly normalized. Echoed back so the UI can
   * show "Niyetin" above the output without re-storing it separately.
   */
  intent: string;
  /** One rewrite per tone. The dial slides across these with no re-call. */
  variants: Record<ToneId, string>;
}

/* ------------------------------------------------------------------ */
/* Tone definitions                                                    */
/* ------------------------------------------------------------------ */

export interface ToneDef {
  id: ToneId;
  /** Dial position, 0 (left) – 3 (right). */
  order: number;
  /** Display label on the dial, per locale. */
  label: Record<Locale, string>;
  /** Premium-gated? `surgical` and `boss` are premium. */
  premium: boolean;
  /**
   * Instruction injected into the Composer system prompt that defines this
   * tone's character. This is curated IP — the personality lives here.
   */
  direction: Record<Locale, string>;
}

/* ------------------------------------------------------------------ */
/* Few-shot example shapes                                             */
/* ------------------------------------------------------------------ */

export interface DecoderExample {
  input: string;
  result: DecoderResult;
}

export interface ComposerExample {
  intent: string;
  variants: Record<ToneId, string>;
}

/* ------------------------------------------------------------------ */
/* Request payloads (client -> Cloud Function proxy)                   */
/* ------------------------------------------------------------------ */

export interface DecodeRequest {
  text: string;
  locale: Locale;
  /** Premium only. Function ignores `true` for free users. */
  withDefense?: boolean;
}

export interface ComposeRequest {
  intent: string;
  locale: Locale;
  /** Premium "tone memory": tune output to a trained person/voice. */
  persona?: ComposePersona;
}

/** Whether a persona represents the message recipient or the user's own voice. */
export type PersonaKind = 'recipient' | 'self';

export interface ComposePersona {
  name: string;
  kind: PersonaKind;
  /** A few sample messages that capture how this person writes. */
  samples: string[];
}
