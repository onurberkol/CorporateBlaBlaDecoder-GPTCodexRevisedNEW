import { httpsCallable, type FunctionsError } from 'firebase/functions';
import type { ComposePersona, ComposerResult, DecoderResult, Locale, ToneId } from '@corporate-blabla/core';
import { functions } from './firebase';

export interface QuotaMeta {
  tier: 'free' | 'premium';
  remaining: Record<'decode' | 'compose', number | null>;
  locked: ToneId[];
}

export class QuotaError extends Error {}
export class BackendUnavailableError extends Error {}

function requireFunctions() {
  if (!functions) throw new BackendUnavailableError('AI service is not configured yet');
  return functions;
}

function normalizeError(error: unknown): never {
  const code = (error as FunctionsError | undefined)?.code;
  if (code === 'functions/resource-exhausted') throw new QuotaError('Daily free limit reached');
  throw error instanceof Error ? error : new Error('Unexpected service error');
}

export async function decode(text: string, locale: Locale, withDefense: boolean) {
  try {
    const call = httpsCallable<{ text: string; locale: Locale; withDefense: boolean }, { result: DecoderResult; meta: QuotaMeta }>(requireFunctions(), 'decode');
    return (await call({ text, locale, withDefense })).data;
  } catch (error) {
    return normalizeError(error);
  }
}

export async function compose(intent: string, locale: Locale, persona?: ComposePersona) {
  try {
    const call = httpsCallable<{ intent: string; locale: Locale; persona?: ComposePersona }, { result: ComposerResult; meta: QuotaMeta }>(requireFunctions(), 'compose');
    return (await call({ intent, locale, persona })).data;
  } catch (error) {
    return normalizeError(error);
  }
}

export async function openPlaza(day: string): Promise<number> {
  const call = httpsCallable<{ day: string }, { count: number }>(requireFunctions(), 'openPlaza');
  return (await call({ day })).data.count;
}

export async function deleteAccount(): Promise<void> {
  const call = httpsCallable<undefined, { deleted: boolean }>(requireFunctions(), 'deleteAccount');
  await call();
}
