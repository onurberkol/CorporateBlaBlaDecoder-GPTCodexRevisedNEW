import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, font } from '../theme';
import { tr } from '../lib/strings';
import type { Locale } from '@corporate-blabla/core';

export function Header({
  locale,
  right,
  showHistory = true,
}: {
  locale: Locale;
  right?: React.ReactNode;
  showHistory?: boolean;
}) {
  const t = useTheme();
  const s = tr(locale);
  const router = useRouter();

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 22,
        paddingBottom: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: t.line,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
        <View
          style={{
            width: 23,
            height: 23,
            borderRadius: 4,
            borderWidth: 2,
            borderColor: t.accent,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: t.accent, fontSize: 13, fontFamily: font.serif }}>cb</Text>
        </View>
        <Text style={{ fontFamily: font.serif, fontSize: 17, color: t.text }}>
          {s('brand')}
        </Text>
      </View>

      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        {right}
        {showHistory && (
          <Pressable
            onPress={() => router.push('/archive')}
            accessibilityRole="button"
            accessibilityLabel={s('archive_title')}
            hitSlop={8}
          >
            <Ionicons name="time-outline" size={20} color={t.muted} />
          </Pressable>
        )}
      </View>
    </View>
  );
}
