import { onCall, HttpsError } from 'firebase-functions/v2/https';
import {
  buildComposerSystemPrompt,
  TONES,
  type ComposerResult,
  type ComposeRequest,
  type ComposePersona,
  type Locale,
  type ToneId,
} from '@corporate-blabla/core';
import { OPENAI_API_KEY, MAX_INPUT, REGION, ENFORCE_APP_CHECK } from './config';
import { composerResultSchema, generateJSON } from './ai';
import { consumeQuota, refundQuota } from './quota';
import { validateComposer } from './validate';

const LOCALES: Locale[] = ['tr', 'en'];
const PREMIUM_TONES: ToneId[] = (Object.values(TONES) as (typeof TONES)[ToneId][])
  .filter((t) => t.premium)
  .map((t) => t.id);

const MAX_SAMPLES = 5;
const MAX_SAMPLE_CHARS = 500;

/** Premium-gate + bound a persona before it reaches the prompt. */
function sanitizePersona(
  persona: ComposePersona | undefined,
  isPremium: boolean
): ComposePersona | undefined {
  if (!isPremium || !persona) return undefined;
  const samples = Array.isArray(persona.samples)
    ? persona.samples
        .filter((s) => typeof s === 'string' && s.trim())
        .slice(0, MAX_SAMPLES)
        .map((s) => s.trim().slice(0, MAX_SAMPLE_CHARS))
    : [];
  if (samples.length === 0) return undefined;
  return {
    name: String(persona.name ?? '').slice(0, 60) || 'Persona',
    kind: persona.kind === 'self' ? 'self' : 'recipient',
    samples,
  };
}

export const compose = onCall(
  {
    region: REGION,
    secrets: [OPENAI_API_KEY],
    memory: '256MiB',
    timeoutSeconds: 30,
    enforceAppCheck: ENFORCE_APP_CHECK,
  },
  async (req) => {
    const uid = req.auth?.uid;
    if (!uid) throw new HttpsError('unauthenticated', 'Sign-in required.');

    const { intent, locale, persona } = (req.data ?? {}) as ComposeRequest;

    if (typeof intent !== 'string' || !intent.trim())
      throw new HttpsError('invalid-argument', 'intent is required.');
    if (intent.length > MAX_INPUT)
      throw new HttpsError('invalid-argument', `intent exceeds ${MAX_INPUT} chars.`);
    if (!LOCALES.includes(locale))
      throw new HttpsError('invalid-argument', 'locale must be "tr" or "en".');

    const { tier, remaining } = await consumeQuota(uid, 'compose');

    // Tone memory is premium-only. Sanitize and cap to control cost/abuse.
    const safePersona = sanitizePersona(persona, tier === 'premium');

    // Always generate all four tones in one call (cheap, instant dial slide).
    const system = buildComposerSystemPrompt(locale, safePersona);
    let result: ComposerResult;
    try {
      result = await generateJSON<ComposerResult>({
        system,
        user: intent.trim(),
        maxOutputTokens: 800,
        schema: composerResultSchema,
        schemaName: 'composer_result',
        openAIKey: OPENAI_API_KEY.value(),
      });
    } catch (error) {
      await refundQuota(uid, 'compose').catch(() => undefined);
      throw new HttpsError('internal', 'Generation failed. Please retry.', error instanceof Error ? error.message : undefined);
    }
    validateComposer(result);

    // Free users SEE the premium tones exist (locked) — drives conversion.
    // We mask the text server-side so the locked content never reaches them.
    const locked: ToneId[] = tier === 'free' ? PREMIUM_TONES : [];
    for (const tone of locked) result.variants[tone] = '';

    return { result, meta: { tier, remaining, locked } };
  }
);
