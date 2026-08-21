import React, { useRef, useState } from 'react';
import { View, Text, TextInput, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import type { DecoderResult } from '@corporate-blabla/core';
import { useTheme, font, radius, space } from '@/theme';
import { tr } from '@/lib/strings';
import { useUser } from '@/lib/user';
import { decode, QuotaError } from '@/lib/api';
import { addHistory } from '@/lib/history';
import { track, Events } from '@/lib/analytics';
import { PaperCard, Button, Chip, Stamp } from '@/components/ui';
import { Meter } from '@/components/Meter';
import { ShareCard, captureAndShare } from '@/components/ShareCard';
import { Header } from '@/components/Header';

export default function DecoderScreen() {
  const t = useTheme();
  const { locale, tier } = useUser();
  const s = tr(locale);
  const router = useRouter();

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DecoderResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cardRef = useRef<View>(null);

  const isPremium = tier === 'premium';

  async function run() {
    if (!input.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await decode(input.trim(), locale, isPremium);
      setResult(res.result);
      track(Events.decode, { meter: res.result.meter, locale });
      addHistory({
        kind: 'decode',
        locale,
        input: input.trim(),
        output: res.result.translation,
        meter: res.result.meter,
        topTrap: res.result.traps[0]?.phrase,
      });
    } catch (e) {
      setError(e instanceof QuotaError ? s('quota_done') : s('generic_error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 40 }}>
        <Header locale={locale} />

        <Text style={labelStyle(t)}>{s('paste_label')}</Text>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder={s('paste_ph')}
          placeholderTextColor={t.muted}
          accessibilityLabel={s('paste_label')}
          multiline
          style={{
            marginTop: 7,
            minHeight: 84,
            backgroundColor: t.surfaceAlt,
            borderColor: t.line,
            borderWidth: 0.5,
            borderRadius: radius.md,
            padding: 12,
            fontSize: 15,
            color: t.text,
            textAlignVertical: 'top',
          }}
        />

        <View style={{ marginTop: 14 }}>
          <Button label={loading ? '…' : s('decode_cta')} onPress={run} variant="solid" disabled={loading || !input.trim()} />
        </View>

        {error && <Text style={{ color: t.accent, marginTop: 14, fontSize: 13 }}>{error}</Text>}
        {loading && <ActivityIndicator color={t.accent} style={{ marginTop: 24 }} />}

        {result && !loading && (
          <PaperCard style={{ marginTop: 24 }}>
            <View style={{ position: 'absolute', top: 14, right: 12 }}>
              <Stamp label={s('stamp_decoded')} />
            </View>

            <Text style={{ fontSize: 11, letterSpacing: 2, color: t.accent, textTransform: 'uppercase', marginBottom: 8 }}>
              {s('translation')}
            </Text>
            <Text style={{ fontFamily: font.serif, fontSize: 19, lineHeight: 27, color: t.textStrong }}>
              {result.translation}
            </Text>

            <View style={{ height: 0.5, backgroundColor: t.lineSoft, marginVertical: 16 }} />
            <Meter value={result.meter} locale={locale} label={s('pa_meter')} />

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 16 }}>
              {result.traps.map((trap, i) => (
                <Chip key={i} text={`${trap.phrase} = ${trap.meaning}`} />
              ))}
            </View>

            {/* Premium: suggested reply (defense). Free: locked teaser. */}
            <View style={{ height: 0.5, backgroundColor: t.lineSoft, marginVertical: 16 }} />
            {isPremium && result.defense ? (
              <>
                <Text style={{ fontSize: 11, letterSpacing: 2, color: t.accent, textTransform: 'uppercase', marginBottom: 7 }}>
                  {s('defense_label')}
                </Text>
                <Text style={{ fontSize: 14, lineHeight: 21, color: t.text }}>{result.defense}</Text>
              </>
            ) : !isPremium ? (
              <Pressable onPress={() => router.push('/paywall')} style={{ alignItems: 'center', paddingVertical: 4 }}>
                <Text style={{ color: t.textSoft, textAlign: 'center', fontSize: 13 }}>🔒 {s('defense_locked')}</Text>
                <Text style={{ color: t.accent, fontWeight: '500', marginTop: 6, fontSize: 13 }}>{s('unlock')}</Text>
              </Pressable>
            ) : null}

            <View style={{ marginTop: 18 }}>
              <Button label={s('share_result')} variant="accent" onPress={() => { track(Events.share, { surface: 'decoder' }); captureAndShare(cardRef); }} />
            </View>
          </PaperCard>
        )}
      </ScrollView>

      {result && (
        <View style={{ position: 'absolute', left: -9999, top: 0 }}>
          <ShareCard
            ref={cardRef}
            incoming={input.trim()}
            output={result.translation}
            stampLabel={s('stamp_decoded')}
            sectionLabel={s('paste_label')}
            outputLabel={s('translation')}
            locale={locale}
            meter={result.meter}
            meterLabel={s('pa_meter')}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

function labelStyle(t: ReturnType<typeof useTheme>) {
  return {
    fontSize: 11,
    letterSpacing: 1.5,
    color: t.muted,
    textTransform: 'uppercase' as const,
  };
}
