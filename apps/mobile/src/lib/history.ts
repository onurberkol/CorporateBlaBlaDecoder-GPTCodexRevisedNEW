import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Locale, ToneId } from '@corporate-blabla/core';

const KEY = '@corporate-blabla/history/v1';
const MAX_ENTRIES = 50;

export interface HistoryEntry {
  id: string;
  createdAt: number;
  kind: 'decode' | 'compose';
  locale: Locale;
  input: string;
  output: string;
  meter?: number;
  topTrap?: string;
  tone?: ToneId;
}

export async function getHistory(): Promise<HistoryEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const value: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(value) ? value.filter(isHistoryEntry) : [];
  } catch {
    return [];
  }
}

export async function addHistory(entry: Omit<HistoryEntry, 'id' | 'createdAt'>): Promise<void> {
  const history = await getHistory();
  const next: HistoryEntry[] = [{ ...entry, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, createdAt: Date.now() }, ...history].slice(0, MAX_ENTRIES);
  await AsyncStorage.setItem(KEY, JSON.stringify(next));
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}

export interface WeekStats {
  total: number;
  avgMeter: number | null;
  maxMeter: number | null;
  topTrap: string | null;
  topTone: ToneId | null;
}

export function weekStats(history: HistoryEntry[]): WeekStats {
  const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const entries = history.filter((entry) => entry.createdAt >= cutoff);
  const decoded = entries.filter((entry) => typeof entry.meter === 'number');
  const meters = decoded.map((entry) => entry.meter!);
  return {
    total: entries.length,
    avgMeter: meters.length ? Math.round(meters.reduce((sum, value) => sum + value, 0) / meters.length) : null,
    maxMeter: meters.length ? Math.max(...meters) : null,
    topTrap: mostFrequent(decoded.map((entry) => entry.topTrap).filter((value): value is string => Boolean(value))) ?? null,
    topTone: mostFrequent(entries.map((entry) => entry.tone).filter((value): value is ToneId => Boolean(value))) ?? null,
  };
}

function mostFrequent<T extends string>(values: T[]): T | undefined {
  const counts = new Map<T, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0];
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  return Boolean(value) && typeof value === 'object' && typeof (value as HistoryEntry).id === 'string' && typeof (value as HistoryEntry).input === 'string' && typeof (value as HistoryEntry).output === 'string';
}
