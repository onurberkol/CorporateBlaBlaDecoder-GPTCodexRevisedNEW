import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { toneLabel } from '@corporate-blabla/core';
import { useTheme, font, radius, space } from '@/theme';
import { tr } from '@/lib/strings';
import { useUser } from '@/lib/user';
import { getHistory, clearHistory, type HistoryEntry } from '@/lib/history';
import { track, Events } from '@/lib/analytics';
import { ShareCard, captureAndShare, type ShareCardProps } from '@/components/ShareCard';

export default function Archive() {
  const t = useTheme();
  const router = useRouter();
  const { locale } = useUser();
  const s = tr(locale);

  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const [shareProps, setShareProps] = useState<ShareCardProps | null>(null);
  const cardRef = useRef<View>(null);

  useEffect(() => {
    getHistory().then(setEntries);
  }, []);

  function propsFor(e: HistoryEntry): ShareCardProps {
    if (e.kind === 'decode') {
      return {
        incoming: e.input,
        output: e.output,
        stampLabel: s('stamp_decoded'),
        sectionLabel: s('paste_label'),
        outputLabel: s('translation'),
        locale,
        meter: e.meter,
        meterLabel: s('pa_meter'),
      };
    }
    const label = e.tone ? toneLabel(e.tone, locale) : '';
    return {
      incoming: e.input,
      output: e.output,
      stampLabel: label.toUpperCase(),
      sectionLabel: s('intent_label'),
      outputLabel: label,
      locale,
    };
  }

  async function share(e: HistoryEntry) {
    setShareProps(propsFor(e));
    track(Events.share, { surface: 'archive' });
    // give the off-screen card a frame to render before capturing
    setTimeout(() => captureAndShare(cardRef), 60);
  }

  function confirmClear() {
    Alert.alert(s('archive_clear'), '', [
      { text: locale === 'tr' ? 'Vazgeç' : 'Cancel', style: 'cancel' },
      {
        text: locale === 'tr' ? 'Temizle' : 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearHistory();
          setEntries([]);
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: space.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Pressable onPress={() => router.back()} accessibilityRole="button" accessibilityLabel="Back" hitSlop={8}>
            <Ionicons name="chevron-back" size={24} color={t.text} />
          </Pressable>
          <Text style={{ fontFamily: font.serif, fontSize: 22, color: t.textStrong }}>{s('archive_title')}</Text>
        </View>
        {entries.length > 0 && (
          <Pressable onPress={confirmClear} hitSlop={8}>
            <Text style={{ color: t.accent, fontSize: 13 }}>{s('archive_clear')}</Text>
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: space.lg, paddingTop: 0, paddingBottom: 40 }}>
        {entries.length === 0 && (
          <Text style={{ color: t.muted, marginTop: 40, textAlign: 'center' }}>{s('archive_empty')}</Text>
        )}

        {entries.map((e) => (
          <View
            key={e.id}
            style={{
              backgroundColor: t.card,
              borderColor: t.line,
              borderWidth: 0.5,
              borderRadius: radius.lg,
              padding: space.md,
              marginBottom: 10,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <View
                style={{
                  backgroundColor: t.surfaceAlt,
                  borderRadius: radius.sm,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ fontSize: 10, letterSpacing: 0.6, color: t.textSoft, textTransform: 'uppercase' }}>
                  {e.kind === 'decode' ? s('tab_decoder') : (e.tone ? toneLabel(e.tone, locale) : s('tab_composer'))}
                </Text>
              </View>
              <Pressable onPress={() => share(e)} hitSlop={8} accessibilityRole="button" accessibilityLabel={s('share_result')}>
                <Ionicons name="share-outline" size={18} color={t.muted} />
              </Pressable>
            </View>

            <Text style={{ fontSize: 13, color: t.textSoft }} numberOfLines={2}>“{e.input}”</Text>
            <Text style={{ fontFamily: font.serif, fontSize: 15, color: t.textStrong, marginTop: 6 }} numberOfLines={3}>
              {e.output}
            </Text>
            {typeof e.meter === 'number' && (
              <Text style={{ fontSize: 11, color: t.accent, marginTop: 6 }}>
                {s('pa_meter')} · {e.meter}
              </Text>
            )}
          </View>
        ))}
      </ScrollView>

      {shareProps && (
        <View style={{ position: 'absolute', left: -9999, top: 0 }}>
          <ShareCard ref={cardRef} {...shareProps} />
        </View>
      )}
    </SafeAreaView>
  );
}
