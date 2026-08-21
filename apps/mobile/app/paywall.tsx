import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { PurchasesOffering, PurchasesPackage } from 'react-native-purchases';
import { useTheme, font, radius, space } from '@/theme';
import { tr } from '@/lib/strings';
import { useUser } from '@/lib/user';
import { getCurrentOffering, purchasePackage, restore } from '@/lib/purchases';
import { Button } from '@/components/ui';
import { track, Events } from '@/lib/analytics';

export default function Paywall() {
  const t = useTheme();
  const router = useRouter();
  const { locale } = useUser();
  const s = tr(locale);

  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    track(Events.paywallView);
    getCurrentOffering().then((o) => {
      setOffering(o);
      setLoading(false);
    });
  }, []);

  async function buy(pkg: PurchasesPackage) {
    if (busy) return;
    setBusy(true);
    setMsg(null);
    try {
      const ok = await purchasePackage(pkg);
      if (ok) {
        track(Events.purchase, { pkg: pkg.identifier });
        router.back();
      }
    } catch (e: any) {
      if (!e?.userCancelled) setMsg(locale === 'tr' ? 'Satın alma tamamlanamadı.' : 'Purchase could not be completed.');
    } finally {
      setBusy(false);
    }
  }

  async function onRestore() {
    setBusy(true);
    setMsg(null);
    try {
      const ok = await restore();
      if (ok) router.back();
      else setMsg(locale === 'tr' ? 'Aktif abonelik bulunamadı.' : 'No active subscription found.');
    } finally {
      setBusy(false);
    }
  }

  const benefits = [s('pw_b1'), s('pw_b2'), s('pw_b3'), s('pw_b4')];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }}>
      <ScrollView contentContainerStyle={{ padding: space.xl, paddingBottom: 40 }}>
        <Pressable onPress={() => router.back()} style={{ alignSelf: 'flex-end', padding: 6 }}>
          <Ionicons name="close" size={24} color={t.muted} />
        </Pressable>

        <Text style={{ fontFamily: font.serif, fontSize: 30, color: t.textStrong, marginTop: 4 }}>
          {s('pw_title')}
        </Text>
        <Text style={{ fontSize: 16, lineHeight: 23, color: t.textSoft, marginTop: 8 }}>
          {s('pw_sub')}
        </Text>

        <View style={{ marginTop: 24, gap: 14 }}>
          {benefits.map((b, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Ionicons name="checkmark-circle" size={22} color={t.accent} />
              <Text style={{ fontSize: 15, color: t.text, flex: 1 }}>{b}</Text>
            </View>
          ))}
        </View>

        <View style={{ marginTop: 30 }}>
          {loading ? (
            <ActivityIndicator color={t.accent} />
          ) : offering && offering.availablePackages.length > 0 ? (
            offering.availablePackages.map((pkg) => (
              <View key={pkg.identifier} style={{ marginBottom: 10 }}>
                <Pressable
                  onPress={() => buy(pkg)}
                  disabled={busy}
                  style={{
                    backgroundColor: t.accent,
                    borderRadius: radius.md,
                    paddingVertical: 15,
                    alignItems: 'center',
                    opacity: busy ? 0.6 : 1,
                  }}
                >
                  <Text style={{ color: t.bg, fontWeight: '500', fontSize: 15 }}>
                    {pkg.product.title} · {pkg.product.priceString}
                  </Text>
                </Pressable>
              </View>
            ))
          ) : (
            <Text style={{ color: t.muted, fontSize: 13, textAlign: 'center' }}>
              {locale === 'tr'
                ? 'Mağaza ürünleri yüklenemedi (dev build gerekir).'
                : 'Store products unavailable (requires a dev build).'}
            </Text>
          )}

          {msg && <Text style={{ color: t.accent, textAlign: 'center', marginTop: 10 }}>{msg}</Text>}

          <Pressable onPress={onRestore} disabled={busy} style={{ alignItems: 'center', paddingVertical: 16 }}>
            <Text style={{ color: t.textSoft, fontSize: 14 }}>{s('pw_restore')}</Text>
          </Pressable>

          <Text style={{ color: t.muted, fontSize: 11, textAlign: 'center', lineHeight: 16 }}>
            {s('pw_legal')}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
