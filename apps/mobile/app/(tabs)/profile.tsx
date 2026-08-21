import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, Pressable, Linking, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, font, radius, space } from '@/theme';
import { tr } from '@/lib/strings';
import { useUser } from '@/lib/user';
import { deleteAccount } from '@/lib/api';
import { clearHistory } from '@/lib/history';
import { clearPersonas } from '@/lib/personas';
import { restore } from '@/lib/purchases';
import { PaperCard, Button } from '@/components/ui';
import { Header } from '@/components/Header';

const PRIVACY_URL = { tr: 'https://corporateblabla.app/gizlilik', en: 'https://corporateblabla.app/privacy' };
const TERMS_URL = { tr: 'https://corporateblabla.app/kullanim', en: 'https://corporateblabla.app/terms' };
const MORNINGS = ['07:30', '08:00', '08:15', '08:30', '09:00'];
const EVENINGS = ['17:30', '18:00', '18:30', '19:00', '19:30'];

export default function ProfileScreen() {
  const t = useTheme();
  const router = useRouter();
  const { locale, tier, prefs, uid, updatePrefs } = useUser();
  const s = tr(locale);
  const [busy, setBusy] = useState(false);

  async function onRestore() {
    setBusy(true);
    try {
      const ok = await restore();
      Alert.alert(ok ? 'Köşe Ofis aktif' : (locale === 'tr' ? 'Aktif abonelik yok' : 'No active subscription'));
    } finally {
      setBusy(false);
    }
  }

  function confirmDelete() {
    Alert.alert(
      locale === 'tr' ? 'Hesabı sil' : 'Delete account',
      locale === 'tr'
        ? 'Tüm verilerin kalıcı olarak silinecek. Emin misin?'
        : 'All your data will be permanently deleted. Are you sure?',
      [
        { text: locale === 'tr' ? 'Vazgeç' : 'Cancel', style: 'cancel' },
        {
          text: locale === 'tr' ? 'Sil' : 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!uid) return;
            setBusy(true);
            try {
              await deleteAccount();
              await Promise.all([clearHistory(), clearPersonas()]);
              Alert.alert(locale === 'tr' ? 'Hesabın silindi.' : 'Your account was deleted.');
            } catch {
              Alert.alert(locale === 'tr' ? 'Silinemedi, tekrar deneyin.' : 'Could not delete, try again.');
            } finally {
              setBusy(false);
            }
          },
        },
      ]
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: space.lg, paddingBottom: 40 }}>
        <Header locale={locale} />

        {/* Tier */}
        <PaperCard>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontFamily: font.serif, fontSize: 20, color: t.textStrong }}>
              {tier === 'premium' ? s('tier_premium') : s('tier_free')}
            </Text>
            {tier === 'premium' && <Ionicons name="ribbon" size={22} color={t.accent} />}
          </View>
          {tier === 'free' ? (
            <>
              <Text style={{ color: t.textSoft, marginTop: 6, fontSize: 14, lineHeight: 21 }}>
                {s('pw_sub')}
              </Text>
              <View style={{ marginTop: 16 }}>
                <Button label={s('pw_cta')} variant="accent" onPress={() => router.push('/paywall')} />
              </View>
            </>
          ) : (
            <Pressable
              onPress={() =>
                Linking.openURL(
                  Platform.OS === 'ios'
                    ? 'https://apps.apple.com/account/subscriptions'
                    : 'https://play.google.com/store/account/subscriptions'
                )
              }
              style={{ marginTop: 12 }}
            >
              <Text style={{ color: t.accent }}>{s('set_manage')}</Text>
            </Pressable>
          )}
        </PaperCard>

        {/* Notifications */}
        <Text style={sectionStyle(t)}>{s('set_notifications')}</Text>
        <PaperCard>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ fontSize: 15, color: t.text }}>{s('set_notifications')}</Text>
            <Switch
              value={prefs.notifications !== false}
              onValueChange={(v) => updatePrefs({ notifications: v })}
              trackColor={{ true: t.accent, false: t.line }}
            />
          </View>

          {prefs.notifications !== false && (
            <>
              <Text style={{ marginTop: 18, marginBottom: 8, fontSize: 11, letterSpacing: 1, color: t.muted, textTransform: 'uppercase' }}>
                {s('set_commute_morning')}
              </Text>
              <Chips options={MORNINGS} value={prefs.commuteMorning ?? '08:15'} onChange={(v) => updatePrefs({ commuteMorning: v })} />
              <Text style={{ marginTop: 16, marginBottom: 8, fontSize: 11, letterSpacing: 1, color: t.muted, textTransform: 'uppercase' }}>
                {s('set_commute_evening')}
              </Text>
              <Chips options={EVENINGS} value={prefs.commuteEvening ?? '18:30'} onChange={(v) => updatePrefs({ commuteEvening: v })} />
            </>
          )}
        </PaperCard>

        {/* Account & legal */}
        <Text style={sectionStyle(t)}>{locale === 'tr' ? 'Hesap' : 'Account'}</Text>
        <PaperCard>
          <Row
            label={s('set_report')}
            onPress={() => router.push(tier === 'premium' ? '/report' : '/paywall')}
            t={t}
          />
          <Divider t={t} />
          <Row
            label={s('personas_title')}
            onPress={() => router.push(tier === 'premium' ? '/personas' : '/paywall')}
            t={t}
          />
          <Divider t={t} />
          <Row label={s('set_restore')} onPress={onRestore} disabled={busy} t={t} />
          <Divider t={t} />
          <Row label={s('set_privacy')} onPress={() => Linking.openURL(PRIVACY_URL[locale])} t={t} />
          <Divider t={t} />
          <Row label={s('set_terms')} onPress={() => Linking.openURL(TERMS_URL[locale])} t={t} />
          <Divider t={t} />
          <Row label={s('set_delete')} onPress={confirmDelete} danger disabled={busy} t={t} />
        </PaperCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ label, onPress, danger, disabled, t }: any) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, opacity: disabled ? 0.5 : 1 }}>
      <Text style={{ fontSize: 15, color: danger ? t.accent : t.text }}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color={t.muted} />
    </Pressable>
  );
}

function Divider({ t }: any) {
  return <View style={{ height: 0.5, backgroundColor: t.lineSoft }} />;
}

function Chips({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((o) => {
        const active = o === value;
        return (
          <Pressable
            key={o}
            onPress={() => onChange(o)}
            style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.md, backgroundColor: active ? t.accent : t.surfaceAlt, borderWidth: 0.5, borderColor: active ? t.accent : t.line }}
          >
            <Text style={{ color: active ? t.bg : t.text, fontWeight: active ? '500' : '400', fontSize: 13 }}>{o}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function sectionStyle(t: any) {
  return { marginTop: 22, marginBottom: 10, fontSize: 11, letterSpacing: 1.5, color: t.muted, textTransform: 'uppercase' as const };
}
