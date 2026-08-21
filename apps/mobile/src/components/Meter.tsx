import React from 'react';
import { View, Text } from 'react-native';
import { meterBand, METER_BAND_LABEL, type Locale } from '@corporate-blabla/core';
import { useTheme, font, type Theme } from '../theme';

export function Meter({
  value,
  locale,
  label,
  theme,
}: {
  value: number;
  locale: Locale;
  label: string;
  theme?: Theme;
}) {
  const themed = useTheme();
  const t = theme ?? themed;
  const band = meterBand(value);
  return (
    <View
      accessible
      accessibilityRole="progressbar"
      accessibilityLabel={`${label}: ${Math.round(value)}, ${METER_BAND_LABEL[band][locale]}`}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <Text
          style={{
            fontSize: 10,
            letterSpacing: 0.5,
            color: t.textSoft,
            textTransform: 'uppercase',
          }}
        >
          {label}
        </Text>
        <View
          style={{
            flex: 1,
            height: 6,
            backgroundColor: t.track,
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: `${Math.round(value)}%`,
              height: '100%',
              backgroundColor: t.accent,
            }}
          />
        </View>
        <Text
          style={{
            fontFamily: font.serif,
            fontSize: 16,
            color: t.accent,
            fontWeight: '500',
          }}
        >
          {Math.round(value)}
        </Text>
      </View>
      <Text style={{ fontSize: 11, color: t.muted, marginTop: 4 }}>
        {METER_BAND_LABEL[band][locale]}
      </Text>
    </View>
  );
}
