import React, { useRef, useState } from 'react';
import { LayoutChangeEvent, PanResponder, Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Theme, radius } from '../lib/theme';
import { tap } from '../lib/haptics';

export function Slider({
  theme,
  value,
  min,
  max,
  step = 1,
  onChange,
  tint = 'warm',
  format,
}: {
  theme: Theme;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  tint?: 'warm' | 'mint' | 'violet';
  format?: (v: number) => string;
}) {
  const [width, setWidth] = useState(1);
  const widthRef = useRef(1);
  const valueRef = useRef(value);
  valueRef.current = value;

  const clampSet = (px: number) => {
    const ratio = Math.max(0, Math.min(1, px / widthRef.current));
    const raw = min + ratio * (max - min);
    const snapped = Math.round(raw / step) * step;
    const next = Math.max(min, Math.min(max, +snapped.toFixed(2)));
    if (next !== valueRef.current) {
      valueRef.current = next;
      tap();
      onChange(next);
    }
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (e) => clampSet(e.nativeEvent.locationX),
      onPanResponderMove: (e, g) => {
        clampSet(Math.max(0, Math.min(widthRef.current, e.nativeEvent.locationX + 0)) + 0 * g.dx);
      },
    })
  ).current;

  const pct = (value - min) / (max - min);
  const colors = tint === 'mint' ? theme.gradMint : tint === 'violet' ? theme.gradViolet : theme.gradWarm;

  const onLayout = (e: LayoutChangeEvent) => {
    widthRef.current = e.nativeEvent.layout.width;
    setWidth(e.nativeEvent.layout.width);
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Pressable
          onPress={() => {
            tap();
            onChange(Math.max(min, +(value - step).toFixed(2)));
          }}
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: theme.cardAlt,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="remove" size={18} color={theme.textDim} />
        </Pressable>

        <View style={{ flex: 1 }} onLayout={onLayout} {...pan.panHandlers}>
          <View style={{ height: 34, justifyContent: 'center' }}>
            <View style={{ height: 10, borderRadius: 5, backgroundColor: theme.cardAlt, overflow: 'hidden' }}>
              <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{ width: `${pct * 100}%`, height: '100%', borderRadius: 5 }}
              />
            </View>
            <View
              style={{
                position: 'absolute',
                left: Math.max(0, Math.min(width - 24, pct * width - 12)),
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: '#fff',
                borderWidth: 3,
                borderColor: colors[0],
                shadowColor: '#000',
                shadowOpacity: 0.3,
                shadowRadius: 5,
                elevation: 3,
              }}
            />
          </View>
        </View>

        <Pressable
          onPress={() => {
            tap();
            onChange(Math.min(max, +(value + step).toFixed(2)));
          }}
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            backgroundColor: theme.cardAlt,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name="add" size={18} color={theme.textDim} />
        </Pressable>
      </View>
      <Text
        style={{
          color: theme.text,
          fontSize: 26,
          fontWeight: '900',
          textAlign: 'center',
          marginTop: 10,
          letterSpacing: -0.8,
        }}
      >
        {format ? format(value) : value}
      </Text>
    </View>
  );
}

export function SegmentedControl({
  theme,
  options,
  value,
  onChange,
}: {
  theme: Theme;
  options: { key: string; label: string }[];
  value: string;
  onChange: (k: string) => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: theme.cardAlt,
        borderRadius: radius.pill,
        padding: 4,
      }}
    >
      {options.map((o) => {
        const active = o.key === value;
        return (
          <Pressable
            key={o.key}
            onPress={() => {
              tap();
              onChange(o.key);
            }}
            style={{
              flex: 1,
              paddingVertical: 9,
              borderRadius: radius.pill,
              backgroundColor: active ? theme.primary : 'transparent',
              alignItems: 'center',
            }}
          >
            <Text style={{ color: active ? '#fff' : theme.textDim, fontWeight: '800', fontSize: 13 }}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
