import * as Localization from 'expo-localization';
import type { Locale } from '@corporate-blabla/core';

export function deviceLocale(): Locale {
  return Localization.getLocales()[0]?.languageCode === 'tr' ? 'tr' : 'en';
}
