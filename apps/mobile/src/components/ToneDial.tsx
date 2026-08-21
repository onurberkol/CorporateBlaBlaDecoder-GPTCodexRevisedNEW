import React, { useState } from 'react';
import { View, Text, StyleSheet, type LayoutChangeEvent } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import {
  TONE_ORDER,
  TONES,
  toneLabel,
  type ToneId,
  type Locale,
} from '@corporate-blabla/core';
import { useTheme, font } from '../theme';

const PAD = 16;
const THUMB = 22;
const DOT = 11;

export function ToneDial({
  value,
  onChange,
  locale,
  locked = [],
}: {
  value: ToneId;
  onChange: (t: ToneId) => void;
  locale: Locale;
  locked?: ToneId[];
}) {
  const t = useTheme();
  const [width, setWidth] = useState(0);
  const w = useSharedValue(0);
  const index = Math.max(0, TONE_ORDER.indexOf(value));
  const progress = useSharedValue(index);

  // Keep the committed selection in sync when the prop changes externally.
  React.useEffect(() => {
    progress.value = withTiming(index, { duration: 180 });
  }, [index]);

  const step = (val: number) => {
    'worklet';
    const inner = w.value - PAD * 2;
    return inner > 0 ? PAD + (val / (TONE_ORDER.length - 1)) * inner : PAD;
  };

  const commit = (i: number) => {
    const next = TONE_ORDER[i];
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (next !== value) onChange(next);
  };

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      const inner = w.value - PAD * 2;
      if (inner <= 0) return;
      const raw = (e.x - PAD) / inner; // 0..1
      progress.value = Math.min(
        TONE_ORDER.length - 1,
        Math.max(0, raw * (TONE_ORDER.length - 1))
      );
    })
    .onEnd(() => {
      const i = Math.round(progress.value);
      progress.value = withTiming(i, { duration: 140 });
      runOnJS(commit)(i);
    });

  const tap = Gesture.Tap().onEnd((e) => {
    const inner = w.value - PAD * 2;
    if (inner <= 0) return;
    const raw = (e.x - PAD) / inner;
    const i = Math.min(
      TONE_ORDER.length - 1,
      Math.max(0, Math.round(raw * (TONE_ORDER.length - 1)))
    );
    progress.value = withTiming(i, { duration: 160 });
    runOnJS(commit)(i);
  });

  const gesture = Gesture.Exclusive(pan, tap);

  const thumbStyle = useAnimatedStyle(() => ({
    left: step(progress.value) - THUMB / 2,
  }));
  const fillStyle = useAnimatedStyle(() => ({
    width: step(progress.value) - PAD,
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    const next = e.nativeEvent.layout.width;
    setWidth(next);
    w.value = next;
  };

  const innerW = Math.max(0, width - PAD * 2);
  const xOf = (i: number) =>
    innerW > 0 ? PAD + (i / (TONE_ORDER.length - 1)) * innerW : PAD;

  // VoiceOver: expose the dial as an adjustable control (swipe up/down to change).
  const adjust = (dir: 1 | -1) => {
    let i = index + dir;
    while (i >= 0 && i < TONE_ORDER.length && locked.includes(TONE_ORDER[i])) i += dir;
    if (i < 0 || i >= TONE_ORDER.length) return;
    commit(i);
  };

  return (
    <GestureDetector gesture={gesture}>
      <View
        onLayout={onLayout}
        style={styles.wrap}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={locale === 'tr' ? 'Ton kadranı' : 'Tone dial'}
        accessibilityValue={{ text: toneLabel(value, locale) }}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === 'increment') adjust(1);
          else if (e.nativeEvent.actionName === 'decrement') adjust(-1);
        }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      >
        {/* base track + active fill */}
        <View style={[styles.track, { backgroundColor: t.track, left: PAD, right: PAD }]} />
        <Animated.View
          style={[styles.track, { backgroundColor: t.accent, left: PAD }, fillStyle]}
        />

        {/* stops + labels */}
        {TONE_ORDER.map((id, i) => {
          const active = id === value;
          const isLocked = locked.includes(id);
          return (
            <View
              key={id}
              pointerEvents="none"
              style={{ position: 'absolute', top: 0, left: xOf(i) - 40, width: 80, alignItems: 'center' }}
            >
              {!active && (
                <View
                  style={{
                    width: DOT,
                    height: DOT,
                    borderRadius: DOT / 2,
                    marginTop: 4,
                    backgroundColor: t.bg,
                    borderWidth: 2,
                    borderColor: isLocked ? t.muted : t.lineSoft,
                  }}
                />
              )}
              {active && <View style={{ height: DOT + 4 }} />}
              <Text
                numberOfLines={1}
                style={{
                  marginTop: active ? 5 : 9,
                  fontSize: active ? 11 : 10,
                  fontWeight: active ? '500' : '400',
                  color: active ? t.accent : t.muted,
                }}
              >
                {TONES[id].premium && isLocked ? '🔒 ' : ''}
                {toneLabel(id, locale)}
              </Text>
            </View>
          );
        })}

        {/* draggable thumb */}
        <Animated.View
          style={[
            styles.thumb,
            { backgroundColor: t.accent, borderColor: t.bg },
            thumbStyle,
          ]}
        />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  wrap: { height: 46, justifyContent: 'flex-start', paddingTop: 4 },
  track: { position: 'absolute', top: 9, height: 2 },
  thumb: {
    position: 'absolute',
    top: -1,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    borderWidth: 3,
  },
});
