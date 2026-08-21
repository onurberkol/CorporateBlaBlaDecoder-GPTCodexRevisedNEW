import React from 'react';
import { View, Text } from 'react-native';
import type {
  PlazaCardDoc,
  PlazaPayload,
  Locale,
  TrapCard,
  RiddleCard,
  HoroscopeCard,
  BingoCard,
} from '@corporate-blabla/core';
import { useTheme, font } from '../theme';
import { tr } from '../lib/strings';
import { PaperCard, Stamp } from './ui';
import { Meter } from './Meter';
import type { ShareCardProps } from './ShareCard';

/** A built-in card so the screen is never empty if a day wasn't generated. */
export const FALLBACK_CARD: PlazaCardDoc = {
  date: '0000-00-00',
  format: 'trap',
  locales: {
    tr: { kind: 'trap', incoming: 'Müsait olduğunda 5 dk konuşalım mı?', reading: 'Şimdi. 5 dakika değil. Ve iyi haber değil.', meter: 64 },
    en: { kind: 'trap', incoming: 'Got 5 mins when you’re free?', reading: 'Now. Not 5 minutes. And not good news.', meter: 64 },
  },
};

export function PlazaBody({ card, locale }: { card: PlazaCardDoc; locale: Locale }) {
  const t = useTheme();
  const s = tr(locale);
  const p = card.locales[locale];

  const Wrapper = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <PaperCard style={{ marginTop: 14 }}>
      <View style={{ position: 'absolute', top: 14, right: 12 }}>
        <Stamp label={s('stamp_decoded')} />
      </View>
      <Text style={{ fontSize: 11, letterSpacing: 1.5, color: t.muted, textTransform: 'uppercase', marginBottom: 10 }}>
        {label}
      </Text>
      {children}
    </PaperCard>
  );

  if (card.format === 'trap') {
    const c = p as TrapCard;
    return (
      <Wrapper label={s('daily_trap')}>
        <Text style={{ fontSize: 16, color: t.text, lineHeight: 24 }}>“{c.incoming}”</Text>
        <View style={{ height: 0.5, backgroundColor: t.lineSoft, marginVertical: 14 }} />
        <Text style={{ fontSize: 11, letterSpacing: 2, color: t.accent, textTransform: 'uppercase', marginBottom: 7 }}>
          {s('daily_reading')}
        </Text>
        <Text style={{ fontFamily: font.serif, fontSize: 18, lineHeight: 26, color: t.textStrong }}>{c.reading}</Text>
        <View style={{ marginTop: 16 }}>
          <Meter value={c.meter} locale={locale} label={s('pa_meter')} />
        </View>
      </Wrapper>
    );
  }

  if (card.format === 'riddle') {
    const c = p as RiddleCard;
    return (
      <Wrapper label={s('plaza_riddle')}>
        <Text style={{ fontSize: 17, color: t.text, lineHeight: 25 }}>“{c.term}”</Text>
        <View style={{ height: 0.5, backgroundColor: t.lineSoft, marginVertical: 14 }} />
        <Text style={{ fontSize: 11, letterSpacing: 2, color: t.accent, textTransform: 'uppercase', marginBottom: 7 }}>
          {s('translation')}
        </Text>
        <Text style={{ fontFamily: font.serif, fontSize: 18, lineHeight: 26, color: t.textStrong }}>{c.answer}</Text>
      </Wrapper>
    );
  }

  if (card.format === 'horoscope') {
    const c = p as HoroscopeCard;
    return (
      <Wrapper label={s('plaza_horoscope')}>
        <Text style={{ fontFamily: font.serif, fontSize: 22, color: t.accent, marginBottom: 8 }}>{c.sign}</Text>
        <Text style={{ fontFamily: font.serif, fontSize: 18, lineHeight: 27, color: t.textStrong }}>{c.text}</Text>
      </Wrapper>
    );
  }

  // bingo
  const c = p as BingoCard;
  return (
    <Wrapper label={s('plaza_bingo')}>
      <View style={{ gap: 6 }}>
        {[0, 1, 2].map((row) => (
          <View key={row} style={{ flexDirection: 'row', gap: 6 }}>
            {c.cells.slice(row * 3, row * 3 + 3).map((cell, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  minHeight: 64,
                  backgroundColor: t.surfaceAlt,
                  borderRadius: 8,
                  padding: 8,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontSize: 11, color: t.text, textAlign: 'center', lineHeight: 15 }}>{cell}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>
    </Wrapper>
  );
}

/** Map a card to ShareCard props for the off-screen capture. */
export function shareForCard(card: PlazaCardDoc, locale: Locale, s: (k: string) => string): ShareCardProps {
  const p: PlazaPayload = card.locales[locale];
  switch (card.format) {
    case 'trap': {
      const c = p as TrapCard;
      return { incoming: c.incoming, output: c.reading, stampLabel: s('stamp_decoded'), sectionLabel: s('daily_trap'), outputLabel: s('daily_reading'), locale, meter: c.meter, meterLabel: s('pa_meter') };
    }
    case 'riddle': {
      const c = p as RiddleCard;
      return { incoming: c.term, output: c.answer, stampLabel: s('stamp_decoded'), sectionLabel: s('plaza_riddle'), outputLabel: s('translation'), locale };
    }
    case 'horoscope': {
      const c = p as HoroscopeCard;
      return { incoming: c.sign, output: c.text, stampLabel: s('stamp_decoded'), sectionLabel: s('plaza_horoscope'), outputLabel: s('plaza_horoscope'), locale };
    }
    default: {
      const c = p as BingoCard;
      return { incoming: s('bingo_prompt'), output: c.cells.join(' · '), stampLabel: s('stamp_decoded'), sectionLabel: s('plaza_bingo'), outputLabel: s('plaza_bingo'), locale };
    }
  }
}
