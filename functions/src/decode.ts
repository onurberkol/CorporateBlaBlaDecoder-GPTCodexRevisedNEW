import { onCall, HttpsError } from 'firebase-functions/v2/https';
import {
  buildDecoderSystemPrompt,
  type DecoderResult,
  type DecodeRequest,
  type Locale,
} from '@corporate-blabla/core';
import { OPENAI_API_KEY, MAX_INPUT, REGION, ENFORCE_APP_CHECK } from './config';
import { decoderResultSchema, generateJSON } from './ai';
import { consumeQuota, refundQuota } from './quota';
import { validateDecoder } from './validate';

const LOCALES: Locale[] = ['tr', 'en'];

export const decode = onCall(
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

    const { text, locale, withDefense } = (req.data ?? {}) as DecodeRequest;

    if (typeof text !== 'string' || !text.trim())
      throw new HttpsError('invalid-argument', 'text is required.');
    if (text.length > MAX_INPUT)
      throw new HttpsError('invalid-argument', `text exceeds ${MAX_INPUT} chars.`);
    if (!LOCALES.includes(locale))
      throw new HttpsError('invalid-argument', 'locale must be "tr" or "en".');

    // Throws resource-exhausted for free users over the daily limit.
    const { tier, remaining } = await consumeQuota(uid, 'decode');

    // "Savunma önerisi" is premium-only — gated here, never trusted from client.
    const allowDefense = tier === 'premium' && withDefense === true;

    const system = buildDecoderSystemPrompt(locale, allowDefense);
    let result: DecoderResult;
    try {
      result = await generateJSON<DecoderResult>({
        system,
        user: text.trim(),
        maxOutputTokens: 600,
        schema: decoderResultSchema,
        schemaName: 'decoder_result',
        openAIKey: OPENAI_API_KEY.value(),
      });
    } catch (error) {
      await refundQuota(uid, 'decode').catch(() => undefined);
      throw new HttpsError('internal', 'Generation failed. Please retry.', error instanceof Error ? error.message : undefined);
    }
    validateDecoder(result);
    if (!allowDefense) delete result.defense;

    return { result, meta: { tier, remaining } };
  }
);
