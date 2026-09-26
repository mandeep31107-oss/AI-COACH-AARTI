import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Theme, radius } from '../lib/theme';
import { tap } from '../lib/haptics';

/* ---------------- Card ---------------- */
export function Card({
  theme,
  children,
  style,
  padded = true,
}: {
  theme: Theme;
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  padded?: boolean;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: theme.card,
          borderRadius: radius.lg,
          borderWidth: 1,
          borderColor: theme.border,
          padding: padded ? 18 : 0,
          shadowColor: theme.shadow,
          shadowOpacity: theme.mode === 'dark' ? 0.45 : 0.09,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 8 },
          elevation: 4,
        },
        style as ViewStyle,
      ]}
    >
      {children}
    </View>
  );
}

/* ---------------- Section header ---------------- */
export function SectionTitle({
  theme,
  title,
  action,
  onAction,
}: {
  theme: Theme;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionRow}>
      <Text style={{ color: theme.text, fontSize: 18, fontWeight: '800', letterSpacing: -0.3 }}>{title}</Text>
      {action ? (
        <Pressable onPress={onAction} hitSlop={10}>
          <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '700' }}>{action}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/* ---------------- Gradient button ---------------- */
export function GradientButton({
  theme,
  label,
  icon,
  onPress,
  tint = 'warm',
  disabled,
  style,
  small,
}: {
  theme: Theme;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  tint?: 'warm' | 'mint' | 'violet';
  disabled?: boolean;
  style?: ViewStyle;
  small?: boolean;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const colors = tint === 'mint' ? theme.gradMint : tint === 'violet' ? theme.gradViolet : theme.gradWarm;
  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <Pressable
        disabled={disabled}
        onPressIn={() => Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
        onPress={() => {
          tap('medium');
          onPress();
        }}
      >
        <LinearGradient
          colors={disabled ? [theme.cardAlt, theme.cardAlt] : colors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: small ? 11 : 16,
            paddingHorizontal: small ? 16 : 22,
            borderRadius: radius.pill,
          }}
        >
          {icon ? <Ionicons name={icon} size={small ? 16 : 19} color={disabled ? theme.textFaint : '#fff'} /> : null}
          <Text
            style={{
              color: disabled ? theme.textFaint : '#fff',
              fontWeight: '800',
              fontSize: small ? 13.5 : 15.5,
              letterSpacing: -0.2,
            }}
          >
            {label}
          </Text>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
}

/* ---------------- Ghost button ---------------- */
export function GhostButton({
  theme,
  label,
  icon,
  onPress,
  style,
}: {
  theme: Theme;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 7,
          paddingVertical: 13,
          paddingHorizontal: 18,
          borderRadius: radius.pill,
          borderWidth: 1,
          borderColor: theme.border,
          backgroundColor: pressed ? theme.cardAlt : 'transparent',
        },
        style as ViewStyle,
      ]}
    >
      {icon ? <Ionicons name={icon} size={17} color={theme.textDim} /> : null}
      <Text style={{ color: theme.text, fontWeight: '700', fontSize: 14 }}>{label}</Text>
    </Pressable>
  );
}

/* ---------------- Chip ---------------- */
export function Chip({
  theme,
  label,
  sub,
  icon,
  selected,
  onPress,
  wide,
}: {
  theme: Theme;
  label: string;
  sub?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  selected?: boolean;
  onPress: () => void;
  wide?: boolean;
}) {
  const anim = useRef(new Animated.Value(selected ? 1 : 0)).current;
  useEffect(() => {
    Animated.timing(anim, {
      toValue: selected ? 1 : 0,
      duration: 180,
      easing: Easing.out(Easing.quad),
      useNativeDriver: false,
    }).start();
  }, [selected, anim]);

  return (
    <Pressable
      onPress={() => {
        tap();
        onPress();
      }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: sub ? 13 : 11,
        paddingHorizontal: 15,
        borderRadius: radius.md,
        borderWidth: 1.5,
        borderColor: selected ? theme.primary : theme.border,
        backgroundColor: selected ? theme.primarySoft : theme.cardAlt,
        width: wide ? '100%' : undefined,
        marginBottom: 9,
        marginRight: wide ? 0 : 9,
      }}
    >
      {icon ? (
        <Ionicons name={icon} size={19} color={selected ? theme.primary : theme.textDim} />
      ) : null}
      <View style={{ flex: wide ? 1 : undefined }}>
        <Text style={{ color: selected ? theme.text : theme.textDim, fontWeight: '700', fontSize: 14.5 }}>
          {label}
        </Text>
        {sub ? <Text style={{ color: theme.textFaint, fontSize: 11.5, marginTop: 2 }}>{sub}</Text> : null}
      </View>
      {selected ? <Ionicons name="checkmark-circle" size={19} color={theme.primary} /> : null}
    </Pressable>
  );
}

/* ---------------- Pill badge ---------------- */
export function Pill({
  theme,
  label,
  color,
  icon,
}: {
  theme: Theme;
  label: string;
  color?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const c = color || theme.accent;
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: radius.pill,
        backgroundColor: c + '22',
      }}
    >
      {icon ? <Ionicons name={icon} size={12} color={c} /> : null}
      <Text style={{ color: c, fontSize: 11.5, fontWeight: '800' }}>{label}</Text>
    </View>
  );
}

/* ---------------- Fade-in wrapper ---------------- */
export function FadeIn({
  children,
  delay = 0,
  style,
  from = 16,
}: {
  children: React.ReactNode;
  delay?: number;
  style?: ViewStyle;
  from?: number;
}) {
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(a, {
      toValue: 1,
      duration: 420,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [a, delay]);
  return (
    <Animated.View
      style={[
        style,
        {
          opacity: a,
          transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [from, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

/* ---------------- Stat tile ---------------- */
export function StatTile({
  theme,
  value,
  label,
  icon,
  color,
}: {
  theme: Theme;
  value: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.card,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: theme.border,
        padding: 14,
      }}
    >
      <View
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          backgroundColor: color + '22',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 10,
        }}
      >
        <Ionicons name={icon} size={17} color={color} />
      </View>
      <Text style={{ color: theme.text, fontSize: 21, fontWeight: '900', letterSpacing: -0.6 }}>{value}</Text>
      <Text style={{ color: theme.textFaint, fontSize: 11.5, marginTop: 2, fontWeight: '600' }}>{label}</Text>
    </View>
  );
}

export function EmptyState({
  theme,
  icon,
  title,
  body,
}: {
  theme: Theme;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  body: string;
}) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 44, paddingHorizontal: 30 }}>
      <View
        style={{
          width: 66,
          height: 66,
          borderRadius: 33,
          backgroundColor: theme.cardAlt,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Ionicons name={icon} size={28} color={theme.textFaint} />
      </View>
      <Text style={{ color: theme.text, fontWeight: '800', fontSize: 16, marginBottom: 6 }}>{title}</Text>
      <Text style={{ color: theme.textFaint, fontSize: 13.5, textAlign: 'center', lineHeight: 20 }}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
  },
});

export const textStyles = (theme: Theme) => ({
  h1: { color: theme.text, fontSize: 30, fontWeight: '900', letterSpacing: -0.8 } as TextStyle,
  h2: { color: theme.text, fontSize: 21, fontWeight: '800', letterSpacing: -0.4 } as TextStyle,
  body: { color: theme.textDim, fontSize: 14, lineHeight: 21 } as TextStyle,
  dim: { color: theme.textFaint, fontSize: 12.5 } as TextStyle,
});
