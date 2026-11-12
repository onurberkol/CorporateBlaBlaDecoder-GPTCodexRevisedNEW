import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PersonaKind } from '@corporate-blabla/core';

const KEY = '@corporate-blabla/personas/v1';
const MAX_PERSONAS = 10;
const MAX_SAMPLES = 5;
const MAX_SAMPLE_CHARS = 500;

export interface Persona { id: string; name: string; kind: PersonaKind; samples: string[] }

export async function getPersonas(): Promise<Persona[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const value: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(value) ? value.filter(isPersona) : [];
  } catch { return []; }
}

export async function upsertPersona(input: Omit<Persona, 'id'> & { id?: string }): Promise<Persona[]> {
  const list = await getPersonas();
  const persona: Persona = { id: input.id || `persona-${Date.now()}`, name: input.name.trim().slice(0, 60), kind: input.kind, samples: input.samples.map((sample) => sample.trim().slice(0, MAX_SAMPLE_CHARS)).filter(Boolean).slice(0, MAX_SAMPLES) };
  if (!persona.name || !persona.samples.length) throw new Error('A persona needs a name and at least one sample.');
  const withoutCurrent = list.filter((item) => item.id !== persona.id);
  const next = [persona, ...withoutCurrent].slice(0, MAX_PERSONAS);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export async function deletePersona(id: string): Promise<Persona[]> {
  const next = (await getPersonas()).filter((persona) => persona.id !== id);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export async function clearPersonas(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}

function isPersona(value: unknown): value is Persona {
  return Boolean(value) && typeof value === 'object' && typeof (value as Persona).id === 'string' && typeof (value as Persona).name === 'string' && Array.isArray((value as Persona).samples) && ((value as Persona).kind === 'self' || (value as Persona).kind === 'recipient');
}
