import type { PlazaFormat } from '@corporate-blabla/core';

const VOICE = `Voice rules for "Corporate BlaBla Decoder":
- The humor comes from being TOO ACCURATE about office life, never from exaggeration or puns.
- Short and scalpel-like. A reader should think "yes, that's exactly it" and laugh.
- TR content = authentic Istanbul "plaza" Turkish (rica etsem, loop'a almak, EOD, sync'lemek).
- EN content = authentic US corporate idiom (per my last email, circle back, bandwidth, for visibility).
- EN is transcreated, never a literal translation of the TR.`;

const SPEC: Record<PlazaFormat, string> = {
  trap: `Format: "trap" — a guess-the-meaning ritual.
Fields per locale: { "incoming": string, "reading": string, "meter": integer 0-100 }
- "incoming": one realistic passive-aggressive work message (one line).
- "reading": the blunt real meaning, 1-2 short sentences.
- "meter": passive-aggressiveness 0-100 (45-85 typical; 90+ only for manager-looping escalation).
Example TR incoming: "Müsait olduğunda bir bakar mısın? Acelesi yok." reading: "Şimdi bak. 'Acelesi yok' en agresif kısmı." meter 64.`,

  riddle: `Format: "riddle" — translate the jargon.
Fields per locale: { "term": string, "answer": string }
- "term": a corporate phrase or acronym.
- "answer": its blunt real meaning, one punchy sentence.
Example TR: term "EOD'a dönerim" answer "Bu gece 23:59'da. Ya da hiç."
Example EN: term "Let's take this offline" answer "Stop talking where there's a record."`,

  horoscope: `Format: "horoscope" — a playful corporate horoscope.
Fields per locale: { "sign": string, "text": string }
- "sign": a playful zodiac-style name made of office speak (TR e.g. "Rica Etsem", EN e.g. "Per My Last Email").
- "text": a funny 1-2 sentence "prediction" about today's office life.`,

  bingo: `Format: "bingo" — meeting bingo squares.
Fields per locale: { "cells": string[9] }
- Exactly 9 very short squares (2-5 words) describing universal meeting moments.
Example TR cells: "duyuyor musunuz?", "ekranı paylaşamayan", "mute'u açık unutan"…
Example EN cells: "you're on mute", "can everyone see my screen?", "let's circle back"…`,
};

/** System prompt that makes the model emit { tr, en } payloads for one card. */
export function buildPlazaGenerationPrompt(format: PlazaFormat, avoid: string[]): string {
  const avoidBlock =
    avoid.length > 0
      ? `\n\nDo NOT repeat or closely echo any of these recently used ideas:\n- ${avoid.slice(-25).join('\n- ')}`
      : '';

  return `You generate one daily card for "Corporate BlaBla Decoder".

${VOICE}

${SPEC[format]}

Output format — CRITICAL: return ONLY a single JSON object, no markdown, no preamble:
{ "tr": <payload>, "en": <payload> }
where each payload contains exactly the fields listed for this format (no "kind" field).
The tr and en cards should express the SAME idea, each in its own native office voice.${avoidBlock}`;
}
