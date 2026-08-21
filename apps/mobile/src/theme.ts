import { useColorScheme } from 'react-native';

/**
 * Brand palette, lifted directly from the approved mockups.
 * The product surface adapts light/dark, but the share artifact (and the
 * "paper" card motif) intentionally stays paper in BOTH modes — that paper +
 * stamp-red identity is what makes a share card recognizable in a group chat.
 */
export const STAMP_RED = '#BC3B2E';
export const STAMP_WASH = '#F6E3DF';
export const STAMP_TEXT = '#8E2A20';

const light = {
  mode: 'light' as const,
  bg: '#F4F1EA', // paper
  card: '#FBFAF6',
  surfaceAlt: '#EDE7DA',
  line: '#DDD4C3',
  lineSoft: '#D4CBB9',
  track: '#E2DACA',
  text: '#221F1B', // ink
  textStrong: '#1A1714',
  textSoft: '#6B6358',
  muted: '#A89E8E',
  accent: STAMP_RED,
  accentWash: STAMP_WASH,
  accentText: STAMP_TEXT,
};

const dark = {
  mode: 'dark' as const,
  bg: '#1B1916', // füme
  card: '#23201C',
  surfaceAlt: '#2A2722',
  line: '#3A352E',
  lineSoft: '#332F29',
  track: '#3A352E',
  text: '#F0EBE0', // krem mürekkep
  textStrong: '#F7F3EA',
  textSoft: '#B3AA9B',
  muted: '#8A8276',
  accent: '#D6584A',
  accentWash: '#3A2521',
  accentText: '#E9A89F',
};

export type Theme = typeof light | typeof dark;

/** Always-paper palette for the ShareCard, regardless of system theme. */
export const paperTheme = light;

// The system is intentionally more editorial than "friendly SaaS": small
// document corners, a square rubber-stamp edge and rounded values only where
// a control benefits from a tactile affordance.
export const radius = { sm: 3, md: 6, lg: 9, xl: 14, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 22, xxl: 28 };

export const font = {
  // Loaded in app/_layout via expo-font (@expo-google-fonts). The editorial
  // serif is core to the identity; falls back to system if a load fails.
  serif: 'Fraunces_600SemiBold',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
};

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}
