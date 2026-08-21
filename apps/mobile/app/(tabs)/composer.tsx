import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Clipboard from 'expo-clipboard';
import {
  TONES,
  toneLabel,
  type ToneId,
  type ComposerResult,
} from '@corporate-blabla/core';
import { useTheme, font, radius, space } from '@/theme';
import { tr } from '@/lib/strings';
import { useUser } from '@/lib/user';
import { compose, QuotaError, type QuotaMeta } from '@/lib/api';
import { addHistory } from '@/lib/history';
import { getPersonas, type Persona } from '@/lib/personas';
import { track, Events } from '@/lib/analytics';
import { PaperCard, Button } from '@/components/ui';
import { ToneDial } from '@/components/ToneDial';
import { ShareCard, captureAndShare } from '@/components/ShareCard';
import { Header } from '@/components/Header';

export default function ComposerScreen() {
  const t = useTheme();
  const { locale, tier } = useUser();
  const s = tr(locale);
  const router = useRouter();
  const isPremium = tier === 'premium';

  const [intent, setIntent] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ComposerResult | null>(null);
  const [meta, setMeta] = useState<QuotaMeta | null>(null);
  const [tone, setTone] = useState<ToneId>('kind');
  const [error, setError] = useState<string | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [personaId, setPersonaId] = useState<string | null>(null);
  const cardRef = useRef<View>(null);

  useEffect(() => {
    if (isPremium) getPersonas().then(setPersonas);
  }, [isPremium]);

  const selectedPersona = personas.find((p) => p.id === personaId) ?? null;

  const locked = meta?.locked ?? [];
  const isLocked = locked.includes(tone);
  const text = result?.variants[tone] ?? '';

  async function run() {
    if (!intent.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const persona =
        isPremium && selectedPersona
          ? { name: selectedPersona.name, kind: selectedPersona.kind, samples: selectedPersona.samples }
          : undefined;
      const res = await compose(intent.trim(), locale, persona);
      setResult(res.result);
      setMeta(res.meta);
      setTone('kind');
      track(Events.compose, { persona: !!persona, locale });
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

        <Text style={labelStyle(t)}>{s('intent_label')}</Text>
        <TextInput
          value={intent}
          onChangeText={setIntent}
          placeholder={s('intent_ph')}
          placeholderTextColor={t.muted}
          accessibilityLabel={s('intent_label')}
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

        {/* Tone memory persona selector (premium) */}
        <Text style={[labelStyle(t), { marginTop: 16 }]}>{s('persona_label')}</Text>
        {isPremium ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 7, paddingTop: 8 }}>
            <PersonaChip label={s('persona_none')} active={personaId === null} onPress={() => setPersonaId(null)} t={t} />
            {personas.map((p) => (
              <PersonaChip key={p.id} label={p.name} active={personaId === p.id} onPress={() => setPersonaId(p.id)} t={t} />
            ))}
            <PersonaChip label={s('persona_add')} active={false} onPress={() => router.push('/personas')} t={t} dashed />
          </ScrollView>
        ) : (
          <Pressable onPress={() => router.push('/paywall')} style={{ marginTop: 8 }}>
            <View style={{ alignSelf: 'flex-start', backgroundColor: t.surfaceAlt, borderColor: t.line, borderWidth: 0.5, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 7 }}>
              <Text style={{ fontSize: 13, color: t.textSoft }}>🔒 {s('persona_locked')}</Text>
            </View>
          </Pressable>
        )}

        <View style={{ marginTop: 14 }}>
          <Button
            label={loading ? '…' : s('compose_cta')}
            onPress={run}
            variant="solid"
            disabled={loading || !intent.trim()}
          />
        </View>

        {error && (
          <Text style={{ color: t.accent, marginTop: 14, fontSize: 13 }}>{error}</Text>
        )}

        {loading && (
          <ActivityIndicator color={t.accent} style={{ marginTop: 24 }} />
        )}

        {result && !loading && (
          <View style={{ marginTop: 24 }}>
            <Text style={labelStyle(t)}>{s('tone_dial')}</Text>
            <View style={{ marginTop: 14 }}>
              <ToneDial value={tone} onChange={setTone} locale={locale} locked={locked} />
            </View>

            <PaperCard style={{ marginTop: 20 }}>
              <View
                style={{
                  alignSelf: 'flex-start',
                  backgroundColor: t.accentWash,
                  borderRadius: radius.sm,
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                }}
              >
                <Text style={{ color: t.accentText, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase' }}>
                  {toneLabel(tone, locale)}
                </Text>
              </View>

              {isLocked ? (
                <Pressable
                  onPress={() => router.push('/paywall')}
                  style={{ marginTop: 12, alignItems: 'center', paddingVertical: 12 }}
                >
                  <Text style={{ fontFamily: font.serif, fontSize: 16, color: t.textSoft, textAlign: 'center' }}>
                    🔒 {s('locked_tone')}
                  </Text>
                  <Text style={{ color: t.accent, fontWeight: '500', marginTop: 8 }}>
                    {s('unlock')}
                  </Text>
                </Pressable>
              ) : (
                <Text style={{ marginTop: 10, fontFamily: font.serif, fontSize: 17, lineHeight: 25, color: t.textStrong }}>
                  {text}
                </Text>
              )}
            </PaperCard>

            {!isLocked && (
              <View style={{ flexDirection: 'row', gap: 9, marginTop: 14 }}>
                <View style={{ flex: 1 }}>
                  <Button
                    label={s('copy')}
                    variant="solid"
                    onPress={() => {
                      Clipboard.setStringAsync(text);
                      addHistory({ kind: 'compose', locale, input: intent.trim(), output: text, tone });
                    }}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Button
                    label={s('share_result')}
                    variant="accent"
                    onPress={() => {
                      addHistory({ kind: 'compose', locale, input: intent.trim(), output: text, tone });
                      track(Events.share, { surface: 'composer', tone });
                      captureAndShare(cardRef);
                    }}
                  />
                </View>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      {/* Off-screen capture target */}
      {result && !isLocked && (
        <View style={{ position: 'absolute', left: -9999, top: 0 }}>
          <ShareCard
            ref={cardRef}
            incoming={intent.trim()}
            output={text}
            stampLabel={toneLabel(tone, locale).toUpperCase()}
            sectionLabel={s('intent_label')}
            outputLabel={toneLabel(tone, locale)}
            locale={locale}
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

function PersonaChip({
  label,
  active,
  onPress,
  t,
  dashed,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  t: ReturnType<typeof useTheme>;
  dashed?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: radius.pill,
        backgroundColor: active ? t.accent : t.surfaceAlt,
        borderWidth: dashed ? 1 : 0.5,
        borderColor: active ? t.accent : t.line,
        borderStyle: dashed ? 'dashed' : 'solid',
      }}
    >
      <Text style={{ fontSize: 13, color: active ? t.bg : t.text, fontWeight: active ? '500' : '400' }}>
        {label}
      </Text>
    </Pressable>
  );
}
