import OpenAI from 'openai';
import {
  PLAZA_ROTATION,
  isValidPayload,
  type PlazaFormat,
  type PlazaPayload,
  type PlazaCardDoc,
} from '@corporate-blabla/core';
import { buildPlazaGenerationPrompt } from './prompts';

const MODEL = process.env.OPENAI_MODEL || 'gpt-5.6-luna';
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const payloadSchemas: Record<PlazaFormat, Record<string, unknown>> = {
  trap: { type: 'object', additionalProperties: false, required: ['incoming', 'reading', 'meter'], properties: { incoming: { type: 'string', minLength: 1, maxLength: 300 }, reading: { type: 'string', minLength: 1, maxLength: 500 }, meter: { type: 'integer', minimum: 0, maximum: 100 } } },
  riddle: { type: 'object', additionalProperties: false, required: ['term', 'answer'], properties: { term: { type: 'string', minLength: 1, maxLength: 300 }, answer: { type: 'string', minLength: 1, maxLength: 500 } } },
  horoscope: { type: 'object', additionalProperties: false, required: ['sign', 'text'], properties: { sign: { type: 'string', minLength: 1, maxLength: 80 }, text: { type: 'string', minLength: 1, maxLength: 500 } } },
  bingo: { type: 'object', additionalProperties: false, required: ['cells'], properties: { cells: { type: 'array', minItems: 9, maxItems: 9, items: { type: 'string', minLength: 1, maxLength: 100 } } } },
};

async function callOnce(format: PlazaFormat, avoid: string[]) {
  const system = buildPlazaGenerationPrompt(format, avoid);
  const resp = await client.responses.create({
    model: MODEL,
    reasoning: { effort: 'low' },
    max_output_tokens: 700,
    input: [{ role: 'developer', content: system }, { role: 'user', content: `Generate one new "${format}" card.` }],
    text: { format: { type: 'json_schema', name: `plaza_${format}`, strict: true, schema: { type: 'object', additionalProperties: false, required: ['tr', 'en'], properties: { tr: payloadSchemas[format], en: payloadSchemas[format] } } } },
  });
  if (!resp.output_text) throw new Error('OpenAI returned no card output');
  return JSON.parse(resp.output_text) as { tr: unknown; en: unknown };
}

/** Generate one validated card (both locales) for a format. */
export async function generateCard(
  format: PlazaFormat,
  avoid: string[]
): Promise<{ tr: PlazaPayload; en: PlazaPayload }> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const out = await callOnce(format, avoid);
      if (isValidPayload(format, out.tr) && isValidPayload(format, out.en)) {
        // attach discriminant
        const tr = { kind: format, ...(out.tr as Record<string, unknown>) } as PlazaPayload;
        const en = { kind: format, ...(out.en as Record<string, unknown>) } as PlazaPayload;
        if (format === 'trap') {
          (tr as { meter: number }).meter = Math.round((tr as { meter: number }).meter);
          (en as { meter: number }).meter = Math.round((en as { meter: number }).meter);
        }
        return { tr, en };
      }
    } catch {
      /* retry */
    }
  }
  throw new Error(`Failed to generate a valid "${format}" card after 2 attempts`);
}

function addDays(iso: string, n: number): string {
  const d = new Date(iso + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Etc/UTC' }).format(d);
}

/** A short signature of a card used to avoid repeats across the batch. */
function signature(format: PlazaFormat, p: PlazaPayload): string {
  switch (format) {
    case 'trap':
      return (p as { incoming: string }).incoming;
    case 'riddle':
      return (p as { term: string }).term;
    case 'horoscope':
      return (p as { sign: string }).sign;
    case 'bingo':
      return (p as { cells: string[] }).cells.slice(0, 3).join(' / ');
  }
}

/** Generate `days` cards starting at `start` (YYYY-MM-DD), rotating formats. */
export async function generateBatch(start: string, days: number): Promise<PlazaCardDoc[]> {
  const docs: PlazaCardDoc[] = [];
  const avoid: string[] = [];

  for (let i = 0; i < days; i++) {
    const format = PLAZA_ROTATION[i % PLAZA_ROTATION.length];
    const date = addDays(start, i);
    process.stdout.write(`  ${date}  ${format.padEnd(9)} … `);
    const { tr, en } = await generateCard(format, avoid);
    avoid.push(signature(format, tr));
    docs.push({ date, format, locales: { tr, en } });
    console.log('ok');
  }
  return docs;
}
