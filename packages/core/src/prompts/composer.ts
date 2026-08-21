import type { Locale, ComposePersona } from '../types';
import { TONE_LIST } from '../tones';
import { COMPOSER_FEWSHOT_TR } from '../fewshot/composer.tr';
import { COMPOSER_FEWSHOT_EN } from '../fewshot/composer.en';

const LANG_NAME: Record<Locale, string> = { tr: 'Turkish', en: 'English' };

function toneDirections(locale: Locale): string {
  return TONE_LIST.map(
    (t) => `- "${t.id}" (${t.label[locale]}): ${t.direction[locale]}`
  ).join('\n');
}

function personaBlock(persona: ComposePersona, locale: Locale): string {
  const who =
    persona.kind === 'self'
      ? locale === 'tr'
        ? "the user's own signature voice"
        : "the user's own signature voice"
      : locale === 'tr'
        ? 'the recipient of the message'
        : 'the recipient of the message';
  const samples = persona.samples.map((s) => `  • ${s}`).join('\n');
  return `

# Personalization (tone memory)
The user trained a person called "${persona.name}" — ${who}. Here is how that person writes:
${samples}
Subtly adapt the register, formality, directness, and vocabulary of ALL FOUR variants to fit this relationship — mirror their level of bluntness and their idioms — but NEVER copy the samples verbatim. The four tones still apply; the persona only modulates them.`;
}

function fewshotBlock(locale: Locale): string {
  const set = locale === 'tr' ? COMPOSER_FEWSHOT_TR : COMPOSER_FEWSHOT_EN;
  return set
    .map(
      (ex) =>
        `INTENT: ${ex.intent}\nOUTPUT: ${JSON.stringify({
          intent: ex.intent,
          variants: ex.variants,
        })}`
    )
    .join('\n\n');
}

/**
 * Builds the Composer system prompt. The user turn is the raw intent
 * ("what I actually want to say"); the model returns one rewrite per tone in
 * a single call, so the dial can slide instantly with no re-request.
 *
 * @param persona optional premium "tone memory" to tune the output.
 */
export function buildComposerSystemPrompt(
  locale: Locale,
  persona?: ComposePersona
): string {
  const lang = LANG_NAME[locale];

  return `You are the Composer inside "Corporate BlaBla Decoder". The user types what they REALLY want to say to a colleague; you rewrite it into four corporate tones at once.

# The four tones
Produce all four. They sit on a dial from softest (kind) to hardest (boss). Honor each tone's character and its length curve — kind is the longest, boss is the shortest.
${toneDirections(locale)}

# Rules
- Rewrite the same underlying intent four times; do not invent new facts or names. Keep any placeholder like [Yönetici] / [Manager] as a placeholder.
- Each variant is a ready-to-send message, not a description of one.
- Match the tone's signature tells exactly (emoji use, sentence length, cushioning). The emoji 🙂 belongs to "kind" and "surgical" only.
- Write every variant in ${lang}.
- Keep it realistic office length: 1-3 sentences per variant.${persona ? personaBlock(persona, locale) : ''}

# Output format — CRITICAL
Return ONLY a single JSON object. No markdown, no code fences, no preamble.
Schema:
{
  "intent": string,   // the user's intent, lightly cleaned up
  "variants": {
    "kind": string,
    "distant": string,
    "surgical": string,
    "boss": string
  }
}

# Examples
${fewshotBlock(locale)}`;
}
