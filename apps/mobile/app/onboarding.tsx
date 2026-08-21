import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme, font, radius, space } from '@/theme';
import { tr } from '@/lib/strings';
import { useUser } from '@/lib/user';
import { registerForPush } from '@/lib/notifications';
import { Button, PaperCard } from '@/components/ui';

const MORNINGS = ['07:30', '08:00', '08:15', '08:30', '09:00'];
const EVENINGS = ['17:30', '18:00', '18:30', '19:00', '19:30'];

export default function Onboarding() {
  const t = useTheme();
  const router = useRouter();
  const { uid, locale, completeOnboarding } = useUser();
  const s = tr(locale);

  const [step, setStep] = useState(0);
  const [morning, setMorning] = useState('08:15');
  const [evening, setEvening] = useState('18:30');
  const [busy, setBusy] = useState(false);

  async function finish(notifications: boolean) {
    if (busy) return;
    setBusy(true);
    if (notifications && uid) await registerForPush(uid).catch(() => {});
    await completeOnboarding({
      commuteMorning: morning,
      commuteEvening: evening,
      notifications,
    });
    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ padding: space.xl, flexGrow: 1, justifyContent: 'center' }}>
        {step === 0 && (
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 20 }}>
              <View style={{ width: 30, height: 30, borderRadius: 5, borderWidth: 2, borderColor: t.accent, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: t.accent, fontFamily: font.serif, fontSize: 16 }}>cb</Text>
              </View>
            </View>
            <Text style={{ fontFamily: font.serif, fontSize: 28, lineHeight: 34, color: t.textStrong }}>
              {s('ob_welcome_title')}
            </Text>
            <Text style={{ fontSize: 16, lineHeight: 24, color: t.textSoft, marginTop: 12 }}>
              {s('ob_welcome_sub')}
            </Text>
            <View style={{ marginTop: 28 }}>
              <Button label={s('ob_continue')} variant="solid" onPress={() => setStep(1)} />
            </View>
          </View>
        )}

        {step === 1 && (
          <View>
            <Text style={{ fontFamily: font.serif, fontSize: 24, color: t.textStrong }}>
              {s('ob_commute_q')}
            </Text>

            <Text style={{ marginTop: 24, marginBottom: 10, fontSize: 11, letterSpacing: 1.5, color: t.muted, textTransform: 'uppercase' }}>
              {s('ob_morning')}
            </Text>
            <TimeRow options={MORNINGS} value={morning} onChange={setMorning} />

            <Text style={{ marginTop: 22, marginBottom: 10, fontSize: 11, letterSpacing: 1.5, color: t.muted, textTransform: 'uppercase' }}>
              {s('ob_evening')}
            </Text>
            <TimeRow options={EVENINGS} value={evening} onChange={setEvening} />

            <View style={{ marginTop: 32 }}>
              <Button label={s('ob_continue')} variant="solid" onPress={() => setStep(2)} />
            </View>
          </View>
        )}

        {step === 2 && (
          <View>
            <PaperCard>
              <Text style={{ fontFamily: font.serif, fontSize: 22, color: t.textStrong }}>
                {s('ob_notif_title')}
              </Text>
              <Text style={{ fontSize: 15, lineHeight: 22, color: t.textSoft, marginTop: 10 }}>
                {s('ob_notif_sub')}
              </Text>
            </PaperCard>
            <View style={{ marginTop: 22 }}>
              <Button label={busy ? '…' : s('ob_allow')} variant="accent" onPress={() => finish(true)} disabled={busy} />
            </View>
            <Pressable onPress={() => finish(false)} disabled={busy} style={{ alignItems: 'center', paddingVertical: 16 }}>
              <Text style={{ color: t.muted, fontSize: 14 }}>{s('ob_skip')}</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function TimeRow({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((o) => {
        const active = o === value;
        return (
          <Pressable
            key={o}
            onPress={() => onChange(o)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: radius.md,
              backgroundColor: active ? t.accent : t.surfaceAlt,
              borderWidth: 0.5,
              borderColor: active ? t.accent : t.line,
            }}
          >
            <Text style={{ color: active ? t.bg : t.text, fontWeight: active ? '500' : '400' }}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
