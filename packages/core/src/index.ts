// Explicit re-exports (not `export *`) so every toolchain — tsc, esbuild,
// Metro, and tsx/Node ESM — can statically resolve the named bindings.

// Runtime values
export { TONE_ORDER } from './types';
export {
  TONES,
  TONE_LIST,
  FREE_TONES,
  toneLabel,
  meterBand,
  METER_BAND_LABEL,
} from './tones';
export { PLAZA_ROTATION, isValidPayload } from './plaza';
export { buildDecoderSystemPrompt } from './prompts/decoder';
export { buildComposerSystemPrompt } from './prompts/composer';
export { DECODER_FEWSHOT_TR } from './fewshot/decoder.tr';
export { DECODER_FEWSHOT_EN } from './fewshot/decoder.en';
export { COMPOSER_FEWSHOT_TR } from './fewshot/composer.tr';
export { COMPOSER_FEWSHOT_EN } from './fewshot/composer.en';

// Types
export type {
  Locale,
  ToneId,
  DecoderTrap,
  MeterBand,
  DecoderResult,
  ComposerResult,
  ToneDef,
  DecoderExample,
  ComposerExample,
  DecodeRequest,
  ComposeRequest,
  PersonaKind,
  ComposePersona,
} from './types';
export type {
  PlazaFormat,
  TrapCard,
  HoroscopeCard,
  BingoCard,
  RiddleCard,
  PlazaPayload,
  PlazaCardDoc,
} from './plaza';
