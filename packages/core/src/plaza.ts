import type { Locale } from './types';

/** The rotating daily ritual formats. */
export type PlazaFormat = 'trap' | 'horoscope' | 'bingo' | 'riddle';

export const PLAZA_ROTATION: PlazaFormat[] = ['trap', 'riddle', 'horoscope', 'bingo'];

/** Guess-the-meaning: an incoming line + its blunt reading + a meter. */
export interface TrapCard {
  kind: 'trap';
  incoming: string;
  reading: string;
  meter: number; // 0-100
}

/** A short, funny corporate horoscope. */
export interface HoroscopeCard {
  kind: 'horoscope';
  sign: string; // e.g. "Rica Etsem" / "Per My Last Email"
  text: string;
}

/** Meeting bingo: exactly 9 short squares for a 3x3 grid. */
export interface BingoCard {
  kind: 'bingo';
  cells: string[]; // length 9
}

/** Translate-the-jargon riddle: a term and its real meaning. */
export interface RiddleCard {
  kind: 'riddle';
  term: string;
  answer: string;
}

export type PlazaPayload = TrapCard | HoroscopeCard | BingoCard | RiddleCard;

/** One Firestore doc at dailyPlaza/{date}. */
export interface PlazaCardDoc {
  date: string; // YYYY-MM-DD
  format: PlazaFormat;
  locales: Record<Locale, PlazaPayload>;
}

/** Runtime guard the app and pipeline both use before trusting a payload. */
export function isValidPayload(format: PlazaFormat, p: any): boolean {
  if (!p || typeof p !== 'object') return false;
  switch (format) {
    case 'trap':
      return (
        typeof p.incoming === 'string' &&
        typeof p.reading === 'string' &&
        typeof p.meter === 'number' &&
        p.meter >= 0 &&
        p.meter <= 100
      );
    case 'horoscope':
      return typeof p.sign === 'string' && typeof p.text === 'string';
    case 'bingo':
      return Array.isArray(p.cells) && p.cells.length === 9 && p.cells.every((c: any) => typeof c === 'string');
    case 'riddle':
      return typeof p.term === 'string' && typeof p.answer === 'string';
    default:
      return false;
  }
}
