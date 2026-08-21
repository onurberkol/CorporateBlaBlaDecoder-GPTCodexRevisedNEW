import { HttpsError } from 'firebase-functions/v2/https';
import type { DecoderResult, ComposerResult, ToneId } from '@corporate-blabla/core';
import { TONE_ORDER } from '@corporate-blabla/core';

function bad(msg: string): never {
  throw new HttpsError('internal', `Model output invalid: ${msg}`);
}

export function validateDecoder(r: any): asserts r is DecoderResult {
  if (!r || typeof r !== 'object') bad('not an object');
  if (typeof r.translation !== 'string' || !r.translation.trim())
    bad('translation');
  if (
    typeof r.meter !== 'number' ||
    !Number.isFinite(r.meter) ||
    r.meter < 0 ||
    r.meter > 100
  )
    bad('meter');
  r.meter = Math.round(r.meter);
  if (!Array.isArray(r.traps) || r.traps.length < 1 || r.traps.length > 3)
    bad('traps length');
  for (const t of r.traps) {
    if (typeof t?.phrase !== 'string' || typeof t?.meaning !== 'string')
      bad('trap shape');
  }
  if (r.defense !== undefined && typeof r.defense !== 'string') bad('defense');
}

export function validateComposer(r: any): asserts r is ComposerResult {
  if (!r || typeof r !== 'object') bad('not an object');
  if (typeof r.intent !== 'string') bad('intent');
  if (!r.variants || typeof r.variants !== 'object') bad('variants');
  for (const tone of TONE_ORDER as ToneId[]) {
    if (typeof r.variants[tone] !== 'string') bad(`variant ${tone}`);
  }
}
