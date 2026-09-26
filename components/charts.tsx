import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Text, View } from 'react-native';
import Svg, { Circle, Defs, G, Line, LinearGradient as SvgGrad, Path, Rect, Stop } from 'react-native-svg';
import { Theme } from '../lib/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/* ---------------- Progress Ring ---------------- */
export function ProgressRing({
  size = 150,
  stroke = 13,
  progress,
  theme,
  colors,
  children,
  track,
}: {
  size?: number;
  stroke?: number;
  progress: number; // 0..1
  theme: Theme;
  colors?: [string, string];
  children?: React.ReactNode;
  track?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: Math.max(0, Math.min(1, progress)),
      duration: 900,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, anim]);

  const dashOffset = anim.interpolate({ inputRange: [0, 1], outputRange: [c, 0] });
  const [c1, c2] = colors || theme.gradWarm;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Defs>
          <SvgGrad id="ringGrad" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={c1} />
            <Stop offset="1" stopColor={c2} />
          </SvgGrad>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track || theme.cardAlt} strokeWidth={stroke} fill="none" />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="url(#ringGrad)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${c} ${c}`}
          strokeDashoffset={dashOffset as unknown as number}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ alignItems: 'center' }}>{children}</View>
    </View>
  );
}

/* ---------------- Bar chart ---------------- */
export function BarChart({
  data,
  labels,
  theme,
  height = 150,
  width,
  goal,
}: {
  data: number[];
  labels: string[];
  theme: Theme;
  height?: number;
  width: number;
  goal?: number;
}) {
  const max = Math.max(...data, goal || 0, 10);
  const pad = 6;
  const barW = (width - pad * (data.length - 1)) / data.length;
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [data.join(','), anim]);

  return (
    <View>
      <View style={{ height, flexDirection: 'row', alignItems: 'flex-end', gap: pad }}>
        {data.map((v, i) => {
          const h = Math.max(4, (v / max) * (height - 18));
          const isToday = i === data.length - 1;
          return (
            <View key={i} style={{ width: barW, alignItems: 'center', justifyContent: 'flex-end' }}>
              {v > 0 ? (
                <Text style={{ color: theme.textFaint, fontSize: 9.5, marginBottom: 3, fontWeight: '700' }}>{v}</Text>
              ) : null}
              <Animated.View
                style={{
                  width: barW,
                  height: anim.interpolate({ inputRange: [0, 1], outputRange: [0, h] }),
                  borderRadius: 7,
                  backgroundColor: v === 0 ? theme.cardAlt : isToday ? theme.primary : theme.accent,
                  opacity: v === 0 ? 0.6 : 1,
                }}
              />
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', gap: pad, marginTop: 8 }}>
        {labels.map((l, i) => (
          <Text
            key={i}
            style={{
              width: barW,
              textAlign: 'center',
              color: i === labels.length - 1 ? theme.primary : theme.textFaint,
              fontSize: 10.5,
              fontWeight: '700',
            }}
          >
            {l}
          </Text>
        ))}
      </View>
    </View>
  );
}

/* ---------------- Donut ---------------- */
export function Donut({
  slices,
  size = 130,
  theme,
}: {
  slices: { value: number; color: string; label: string }[];
  size?: number;
  theme: Theme;
}) {
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  const stroke = 18;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={theme.cardAlt} strokeWidth={stroke} fill="none" />
          {slices.map((s, i) => {
            const len = (s.value / total) * c;
            const el = (
              <Circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={r}
                stroke={s.color}
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                strokeLinecap="butt"
                transform={`rotate(-90 ${size / 2} ${size / 2})`}
              />
            );
            offset += len;
            return el;
          })}
        </Svg>
      </View>
      <View style={{ flex: 1, gap: 9 }}>
        {slices.map((s, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: s.color }} />
            <Text style={{ color: theme.textDim, fontSize: 12.5, flex: 1, fontWeight: '600' }}>{s.label}</Text>
            <Text style={{ color: theme.text, fontSize: 12.5, fontWeight: '800' }}>
              {Math.round((s.value / total) * 100)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

/* ---------------- Line chart ---------------- */
export function LineChart({
  points,
  theme,
  width,
  height = 130,
  color,
}: {
  points: number[];
  theme: Theme;
  width: number;
  height?: number;
  color?: string;
}) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const pad = 10;
  const x = (i: number) => pad + (i / (points.length - 1)) * (width - pad * 2);
  const y = (v: number) => pad + (1 - (v - min) / span) * (height - pad * 2);
  const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p).toFixed(1)}`).join(' ');
  const area = `${d} L${x(points.length - 1).toFixed(1)},${height} L${x(0).toFixed(1)},${height} Z`;
  const col = color || theme.accent;

  return (
    <Svg width={width} height={height}>
      <Defs>
        <SvgGrad id="lineFill" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={col} stopOpacity="0.32" />
          <Stop offset="1" stopColor={col} stopOpacity="0" />
        </SvgGrad>
      </Defs>
      <Path d={area} fill="url(#lineFill)" />
      <Path d={d} stroke={col} strokeWidth={2.6} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <Circle key={i} cx={x(i)} cy={y(p)} r={3.2} fill={col} />
      ))}
    </Svg>
  );
}

/* ---------------- Consistency heatmap ---------------- */
export function Heatmap({
  days,
  theme,
  columns = 14,
}: {
  days: { date: string; minutes: number }[];
  theme: Theme;
  columns?: number;
}) {
  const max = Math.max(...days.map((d) => d.minutes), 20);
  const cell = 20;
  const gap = 5;
  const rows = Math.ceil(days.length / columns);
  return (
    <Svg width={columns * (cell + gap)} height={rows * (cell + gap)}>
      {days.map((d, i) => {
        const col = i % columns;
        const row = Math.floor(i / columns);
        const intensity = d.minutes === 0 ? 0 : Math.min(1, 0.28 + (d.minutes / max) * 0.72);
        return (
          <Rect
            key={d.date}
            x={col * (cell + gap)}
            y={row * (cell + gap)}
            width={cell}
            height={cell}
            rx={6}
            fill={intensity === 0 ? theme.cardAlt : theme.accent}
            opacity={intensity === 0 ? 1 : intensity}
          />
        );
      })}
    </Svg>
  );
}
