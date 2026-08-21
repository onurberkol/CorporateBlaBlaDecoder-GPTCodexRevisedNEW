import React, { forwardRef } from 'react';
import { View, Text } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import QRCode from 'react-native-qrcode-svg';
import { paperTheme as p, font, radius, space, STAMP_RED } from '../theme';
import { Stamp } from './ui';
import { Meter } from './Meter';
import type { Locale } from '@corporate-blabla/core';

const SHARE_URL = 'https://corporateblabla.app';

export interface ShareCardProps {
  incoming: string;
  output: string;
  stampLabel: string; // ÇÖZÜLDÜ / DECODED
  sectionLabel: string; // "Gelen mesaj" / "Incoming"
  outputLabel: string; // "Tercüme" / "Translation"
  locale: Locale;
  meter?: number;
  meterLabel?: string;
}

/**
 * The recognizable share artifact. Always paper + stamp-red, in both system
 * themes — that consistency is what makes it identifiable in a group chat.
 * Rendered off-screen and captured to an image for sharing.
 */
export const ShareCard = forwardRef<View, ShareCardProps>(function ShareCard(
  props,
  ref
) {
  return (
    <View
      ref={ref}
      collapsable={false}
      style={{
        width: 360,
        backgroundColor: p.bg,
        borderRadius: radius.lg,
        borderColor: p.line,
        borderWidth: 1,
        padding: space.xl,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          position: 'absolute',
          top: 18,
          right: 16,
        }}
      >
        <Stamp label={props.stampLabel} theme={p} />
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <View
          style={{
            width: 20,
            height: 20,
            borderRadius: 3,
            borderWidth: 1.5,
            borderColor: p.textStrong,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: p.textStrong, fontSize: 12, fontFamily: font.serif }}>cb</Text>
        </View>
        <Text
          style={{
            fontSize: 11,
            letterSpacing: 2.5,
            color: p.textSoft,
            textTransform: 'uppercase',
          }}
        >
          {props.sectionLabel}
        </Text>
      </View>

      <Text style={{ fontSize: 16, color: p.text, lineHeight: 24 }}>“{props.incoming}”</Text>

      <View style={{ height: 1, backgroundColor: p.lineSoft, marginVertical: 18 }} />

      <Text
        style={{
          fontSize: 11,
          letterSpacing: 2.5,
          color: STAMP_RED,
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        {props.outputLabel}
      </Text>
      <Text style={{ fontFamily: font.serif, fontSize: 19, lineHeight: 27, color: p.textStrong }}>
        {props.output}
      </Text>

      {typeof props.meter === 'number' && (
        <View style={{ marginTop: 20 }}>
          <Meter
            value={props.meter}
            locale={props.locale}
            label={props.meterLabel ?? ''}
            theme={p}
          />
        </View>
      )}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginTop: 20,
          paddingTop: 14,
          borderTopWidth: 1,
          borderTopColor: p.lineSoft,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: font.serif, fontSize: 13, letterSpacing: 1.5, color: STAMP_RED }}>
            corporate blabla
          </Text>
          <Text style={{ fontSize: 10.5, color: p.muted, marginTop: 3 }}>
            {props.locale === 'tr' ? 'Karekodu okut, sen de çöz' : 'Scan to decode yours'}
          </Text>
          <Text style={{ fontSize: 10.5, color: p.textSoft, marginTop: 1 }}>corporateblabla.app</Text>
        </View>
        <View style={{ padding: 5, backgroundColor: '#FFFFFF', borderRadius: 6 }}>
          <QRCode value={SHARE_URL} size={46} color={p.textStrong} backgroundColor="#FFFFFF" />
        </View>
      </View>
    </View>
  );
});

/** Capture a ShareCard ref to a PNG and open the OS share sheet. */
export async function captureAndShare(ref: React.RefObject<View | null>) {
  if (!ref.current) return;
  const uri = await captureRef(ref, { format: 'png', quality: 1 });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'image/png' });
  }
}
