import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  type ViewStyle,
  type StyleProp,
} from 'react-native';
import { useTheme, radius, space, font, type Theme } from '../theme';

export function PaperCard({
  children,
  style,
  paper,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** Force the always-paper look (used inside share cards). */
  paper?: Theme;
}) {
  const t = useTheme();
  const c = paper ?? t;
  return (
    <View
      style={[
        {
          backgroundColor: c.card,
          borderColor: c.line,
          borderWidth: StyleSheet.hairlineWidth,
          borderRadius: radius.md,
          padding: space.lg,
          shadowColor: c.mode === 'light' ? '#5A4F43' : '#000000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: c.mode === 'light' ? 0.08 : 0.22,
          shadowRadius: 10,
          elevation: 2,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

/** The rotated rubber stamp: DECODED / ÇÖZÜLDÜ. */
export function Stamp({ label, theme }: { label: string; theme?: Theme }) {
  const themed = useTheme();
  const t = theme ?? themed;
  return (
    <View
      style={{
        transform: [{ rotate: '-9deg' }],
        borderWidth: 2.5,
        borderColor: t.accent,
          borderRadius: 2,
        paddingHorizontal: 11,
        paddingVertical: 4,
        opacity: 0.82,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          color: t.accent,
          fontFamily: font.sansMedium,
          fontSize: 12,
          letterSpacing: 2,
          fontWeight: '500',
        }}
      >
        {label}
      </Text>
    </View>
  );
}

/** A trap chip: "phrase = meaning". */
export function Chip({ text, theme }: { text: string; theme?: Theme }) {
  const themed = useTheme();
  const t = theme ?? themed;
  return (
    <View
      style={{
        backgroundColor: t.surfaceAlt,
        borderRadius: 3,
        paddingHorizontal: 9,
        paddingVertical: 4,
      }}
    >
      <Text style={{ color: t.textSoft, fontSize: 12 }}>{text}</Text>
    </View>
  );
}

export function Button({
  label,
  onPress,
  variant = 'solid',
  icon,
  disabled,
}: {
  label: string;
  onPress: () => void;
      variant?: 'solid' | 'accent' | 'ghost';
  icon?: React.ReactNode;
  disabled?: boolean;
}) {
  const t = useTheme();
  const bg =
    variant === 'accent' ? t.accent : variant === 'solid' ? t.textStrong : 'transparent';
  const fg = variant === 'ghost' ? t.text : t.bg;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: bg,
          borderColor: variant === 'ghost' ? t.text : 'transparent',
          borderWidth: variant === 'ghost' ? 1 : 0,
          opacity: disabled ? 0.5 : pressed ? 0.9 : 1,
        },
      ]}
    >
      {icon}
      <Text style={{ color: fg, fontFamily: font.sansMedium, fontSize: 13, letterSpacing: 0.3 }}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 50,
    paddingVertical: 12,
    borderRadius: 4,
  },
});
