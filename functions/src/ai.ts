import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { AI_PROVIDER, ANTHROPIC_MODEL, OPENAI_MODEL } from './config';

export type AIProviderName = 'openai' | 'anthropic';
export type JsonSchema = Record<string, unknown>;

interface GenerateArgs {
  system: string;
  user: string;
  schema: JsonSchema;
  schemaName: string;
  maxOutputTokens: number;
  openAIKey: string;
  anthropicKey?: string;
}

/**
 * Provider-neutral generation boundary. The application owns the prompt and
 * result schema; adapters own vendor-specific request/response handling.
 */
export async function generateJSON<T>(args: GenerateArgs): Promise<T> {
  const provider = AI_PROVIDER as AIProviderName;
  if (provider === 'openai') return generateOpenAI<T>(args);
  if (provider === 'anthropic' && args.anthropicKey) return generateAnthropic<T>(args);
  throw new Error(`Unsupported or unconfigured AI provider: ${AI_PROVIDER}`);
}

async function generateOpenAI<T>(args: GenerateArgs): Promise<T> {
  const client = new OpenAI({ apiKey: args.openAIKey });
  const response = await client.responses.create({
    model: OPENAI_MODEL,
    reasoning: { effort: 'low' },
    max_output_tokens: args.maxOutputTokens,
    input: [
      { role: 'developer', content: args.system },
      { role: 'user', content: args.user },
    ],
    text: {
      format: {
        type: 'json_schema', name: args.schemaName, strict: true, schema: args.schema,
      },
    },
  });
  if (!response.output_text) throw new Error('OpenAI returned no output text');
  return JSON.parse(response.output_text) as T;
}

async function generateAnthropic<T>(args: GenerateArgs): Promise<T> {
  const client = new Anthropic({ apiKey: args.anthropicKey! });
  const response = await client.messages.create({
    model: ANTHROPIC_MODEL,
    system: args.system,
    max_tokens: args.maxOutputTokens,
    temperature: 0.3,
    messages: [{ role: 'user', content: `${args.user}\n\nReturn only valid JSON matching this schema: ${JSON.stringify(args.schema)}` }],
  });
  const text = response.content.filter((item): item is Anthropic.TextBlock => item.type === 'text').map((item) => item.text).join('');
  return JSON.parse(text) as T;
}

export const decoderResultSchema: JsonSchema = {
  type: 'object', additionalProperties: false,
  required: ['translation', 'meter', 'traps', 'defense'],
  properties: {
    translation: { type: 'string', minLength: 1, maxLength: 1500 },
    meter: { type: 'integer', minimum: 0, maximum: 100 },
    traps: { type: 'array', minItems: 1, maxItems: 3, items: { type: 'object', additionalProperties: false, required: ['phrase', 'meaning'], properties: { phrase: { type: 'string', minLength: 1, maxLength: 200 }, meaning: { type: 'string', minLength: 1, maxLength: 500 } } } },
    // Required for strict JSON Schema compatibility; free-tier responses are
    // stripped before leaving the function, premium prompts fill this value.
    defense: { type: 'string', maxLength: 1000 },
  },
};

export const composerResultSchema: JsonSchema = {
  type: 'object', additionalProperties: false,
  required: ['intent', 'variants'],
  properties: {
    intent: { type: 'string', maxLength: 2000 },
    variants: { type: 'object', additionalProperties: false, required: ['kind', 'distant', 'surgical', 'boss'], properties: { kind: { type: 'string', minLength: 1, maxLength: 1500 }, distant: { type: 'string', minLength: 1, maxLength: 1500 }, surgical: { type: 'string', minLength: 1, maxLength: 1500 }, boss: { type: 'string', minLength: 1, maxLength: 1500 } } },
  },
};
