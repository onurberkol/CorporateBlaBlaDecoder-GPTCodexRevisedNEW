import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme';
import { tr } from '@/lib/strings';
import { deviceLocale } from '@/lib/locale';

export default function TabsLayout() {
  const t = useTheme();
  const s = tr(deviceLocale());

  const icon =
    (name: keyof typeof Ionicons.glyphMap) =>
    ({ color, size }: { color: string; size: number }) =>
      <Ionicons name={name} size={size} color={color} />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.accent,
        tabBarInactiveTintColor: t.muted,
        tabBarStyle: {
          backgroundColor: t.bg,
          borderTopColor: t.line,
          borderTopWidth: 0.5,
          height: 64,
          paddingTop: 7,
        },
        tabBarLabelStyle: { fontSize: 10, letterSpacing: 0.2 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: s('tab_daily'), tabBarIcon: icon('calendar-outline') }}
      />
      <Tabs.Screen
        name="decoder"
        options={{ title: s('tab_decoder'), tabBarIcon: icon('mail-open-outline') }}
      />
      <Tabs.Screen
        name="composer"
        options={{ title: s('tab_composer'), tabBarIcon: icon('create-outline') }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: s('tab_profile'), tabBarIcon: icon('person-outline') }}
      />
    </Tabs>
  );
}
