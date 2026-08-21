import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import type { PlazaCardDoc } from '@corporate-blabla/core';
import { useTheme, radius, space } from '@/theme';
import { tr } from '@/lib/strings';
import { useUser } from '@/lib/user';
import { db } from '@/lib/firebase';
import { openPlaza } from '@/lib/api';
import { Button } from '@/components/ui';
import { ShareCard, captureAndShare } from '@/components/ShareCard';
import { PlazaBody, shareForCard, FALLBACK_CARD } from '@/components/PlazaCard';
import { Header } from '@/components/Header';
import { track, Events } from '@/lib/analytics';

function todayKey() {
  return new Intl.DateTimeFormat('en-CA').format(new Date());
}

export default function PlazaScreen() {
  const t = useTheme();
  const { locale, streak, markDailyEngaged } = useUser();
  const s = tr(locale);
  const cardRef = useRef<View>(null);

  const [card, setCard] = useState<PlazaCardDoc>(FALLBACK_CARD);
  const [crowd, setCrowd] = useState<number | null>(null);

  useEffect(() => {
    const day = todayKey();
    track(Events.plazaOpen);
    markDailyEngaged().catch(() => {});
    getDoc(doc(db, 'dailyPlaza', day))
      .then((snap) => {
        if (snap.exists()) setCard(snap.data() as PlazaCardDoc);
      })
      .catch(() => {});
    openPlaza(day).then(setCrowd).catch(() => {});
  }, []);

  const chainCount = Math.min(7, Math.max(1, streak.count || 1));
  const crowdText = (crowd ?? 14302).toLocaleString(locale === 'tr' ? 'tr-TR' : 'en-US');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 40 }}>
        <Header
          locale={locale}
          right={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: t.accentWash, paddingHorizontal: 9, paddingVertical: 4, borderRadius: radius.pill }}>
              <Ionicons name="flame" size={14} color={t.accent} />
              <Text style={{ color: t.accentText, fontSize: 12, fontWeight: '500' }}>
                {streak.count || 1} {locale === 'tr' ? 'gün' : 'days'}
              </Text>
            </View>
          }
        />

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ fontSize: 11, letterSpacing: 1.5, color: t.muted, textTransform: 'uppercase' }}>
            {s('daily_title')}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <Ionicons name="time-outline" size={13} color={t.muted} />
            <Text style={{ fontSize: 11, color: t.muted }}>{s('next_trap')} 13:28</Text>
          </View>
        </View>

        <PlazaBody card={card} locale={locale} />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 14 }}>
          <View style={{ flexDirection: 'row' }}>
            {['#D8A7A0', '#C9BFAD', '#B6A98F'].map((c, i) => (
              <View key={i} style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: c, borderWidth: 1.5, borderColor: t.bg, marginLeft: i === 0 ? 0 : -8 }} />
            ))}
          </View>
          <Text style={{ fontSize: 12, color: t.textSoft, flex: 1 }}>
            {locale === 'tr' ? (
              <>Bugün <Text style={{ color: t.text, fontWeight: '500' }}>{crowdText}</Text> kişi de buradaydı.</>
            ) : (
              <><Text style={{ color: t.text, fontWeight: '500' }}>{crowdText}</Text> people were here today.</>
            )}
          </Text>
        </View>

        <Text style={{ fontSize: 10, letterSpacing: 1.5, color: t.muted, textTransform: 'uppercase', marginTop: 18, marginBottom: 9 }}>
          {s('streak_week')}
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {Array.from({ length: 7 }).map((_, i) => {
              const on = i < chainCount;
              return (
                <React.Fragment key={i}>
                  {i > 0 && <View style={{ width: 14, height: 2, backgroundColor: on ? t.accent : t.line }} />}
                  <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: on ? t.accent : t.surfaceAlt, borderWidth: on ? 0 : 1, borderColor: t.line }} />
                </React.Fragment>
              );
            })}
          </View>
          <Text style={{ fontSize: 11, color: t.muted }}>{chainCount}/7</Text>
        </View>

        <View style={{ marginTop: 20 }}>
          <Button label={s('share_result')} variant="accent" onPress={() => { track(Events.share, { surface: 'plaza' }); captureAndShare(cardRef); }} />
        </View>
      </ScrollView>

      <View style={{ position: 'absolute', left: -9999, top: 0 }}>
        <ShareCard ref={cardRef} {...shareForCard(card, locale, s)} />
      </View>
    </SafeAreaView>
  );
}
