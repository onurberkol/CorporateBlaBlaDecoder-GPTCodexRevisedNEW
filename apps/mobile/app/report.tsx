import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { toneLabel, meterBand, METER_BAND_LABEL } from '@corporate-blabla/core';
import { useTheme, font, radius, space } from '@/theme';
import { tr } from '@/lib/strings';
import { useUser } from '@/lib/user';
import { getHistory, weekStats, type WeekStats } from '@/lib/history';
import { track, Events } from '@/lib/analytics';
import { PaperCard, Button } from '@/components/ui';
import { ShareCard, captureAndShare } from '@/components/ShareCard';

export default function Report() {
  const t = useTheme();
  const router = useRouter();
  const { locale, tier } = useUser();
  const s = tr(locale);

  const [stats, setStats] = useState<WeekStats | null>(null);
  const cardRef = useRef<View>(null);

  useEffect(() => {
    getHistory().then((h) => setStats(weekStats(h)));
  }, []);

  const isPremium = tier === 'premium';

  function row(label: string, value: string) {
    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 11, borderBottomWidth: 0.5, borderBottomColor: t.lineSoft }}>
        <Text style={{ fontSize: 13, color: t.textSoft }}>{label}</Text>
        <Text style={{ fontFamily: font.serif, fontSize: 16, color: t.textStrong }}>{value}</Text>
      </View>
    );
  }

  const summaryOutput = stats
    ? locale === 'tr'
      ? `En sık tuzak: ${stats.topTrap ?? '—'} · Ortalama: %${stats.avgMeter ?? 0}`
      : `Top trap: ${stats.topTrap ?? '—'} · Avg: ${stats.avgMeter ?? 0}%`
    : '';
  const summaryIncoming = stats
    ? locale === 'tr'
      ? `Bu hafta ${stats.total} mesaj çözdüm.`
      : `I handled ${stats.total} messages this week.`
    : '';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: space.lg }}>
        <Pressable onPress={() => router.back()} hitSlop={8} accessibilityRole="button" accessibilityLabel="Back">
          <Ionicons name="chevron-back" size={24} color={t.text} />
        </Pressable>
        <Text style={{ fontFamily: font.serif, fontSize: 22, color: t.textStrong }}>{s('report_title')}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: space.lg, paddingTop: 0, paddingBottom: 40 }}>
        {!isPremium ? (
          <PaperCard style={{ marginTop: 20, alignItems: 'center' }}>
            <Text style={{ fontFamily: font.serif, fontSize: 17, color: t.textSoft, textAlign: 'center' }}>
              🔒 {s('report_locked')}
            </Text>
            <View style={{ marginTop: 16, alignSelf: 'stretch' }}>
              <Button label={s('unlock')} variant="accent" onPress={() => router.push('/paywall')} />
            </View>
          </PaperCard>
        ) : !stats || stats.total === 0 ? (
          <Text style={{ color: t.muted, marginTop: 40, textAlign: 'center' }}>{s('report_empty')}</Text>
        ) : (
          <>
            <Text style={{ fontSize: 13, color: t.muted, marginBottom: 12 }}>{s('report_sub')}</Text>
            <PaperCard>
              {row(s('report_total'), String(stats.total))}
              {stats.avgMeter !== null &&
                row(
                  s('report_avg'),
                  `${stats.avgMeter} · ${METER_BAND_LABEL[meterBand(stats.avgMeter)][locale]}`
                )}
              {stats.maxMeter !== null && row(s('report_worst'), String(stats.maxMeter))}
              {stats.topTrap && row(s('report_toptrap'), stats.topTrap)}
              {stats.topTone && row(s('report_toptone'), toneLabel(stats.topTone, locale))}
            </PaperCard>

            <View style={{ marginTop: 16 }}>
              <Button label={s('share_result')} variant="accent" onPress={() => { track(Events.share, { surface: 'report' }); captureAndShare(cardRef); }} />
            </View>

            <View style={{ position: 'absolute', left: -9999, top: 0 }}>
              <ShareCard
                ref={cardRef}
                incoming={summaryIncoming}
                output={summaryOutput}
                stampLabel={locale === 'tr' ? 'KARNE' : 'REPORT'}
                sectionLabel={s('report_title')}
                outputLabel={s('report_title')}
                locale={locale}
                meter={stats.avgMeter ?? undefined}
                meterLabel={s('pa_meter')}
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
