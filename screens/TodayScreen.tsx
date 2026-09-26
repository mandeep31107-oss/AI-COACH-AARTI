import React, { useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../lib/AppContext';
import { radius } from '../lib/theme';
import { Card, FadeIn, GhostButton, GradientButton, Pill, SectionTitle, StatTile } from '../components/ui';
import { ProgressRing } from '../components/charts';
import { Slider } from '../components/Slider';
import { emergencyPlan } from '../lib/engine';
import { motivationLine, NO_JUDGEMENT_LINES } from '../lib/coach';
import { RoutineBlock } from '../lib/types';
import { voice } from '../lib/voice';
import { tap } from '../lib/haptics';

const ENERGY = [
  { v: 1, icon: 'battery-dead-outline', label: 'Empty' },
  { v: 2, icon: 'cloudy-outline', label: 'Low' },
  { v: 3, icon: 'partly-sunny-outline', label: 'Okay' },
  { v: 4, icon: 'sunny-outline', label: 'Good' },
  { v: 5, icon: 'flash-outline', label: 'Charged' },
];

export default function TodayScreen({ navigation }: any) {
  const { theme, profile, plan, checkIn, regenerate, completeBlock, addBlock, streak, todayMinutes, logs } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [energy, setEnergy] = useState(3);
  const [budget, setBudget] = useState(20);
  const [rescueOpen, setRescueOpen] = useState(false);
  const [rescueMin, setRescueMin] = useState(5);
  const [choreOpen, setChoreOpen] = useState(false);

  const noJudge = useMemo(
    () => NO_JUDGEMENT_LINES[new Date().getDate() % NO_JUDGEMENT_LINES.length],
    []
  );

  if (!profile) return null;

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = profile.name.split(' ')[0];

  const done = plan ? plan.completed.length : 0;
  const total = plan ? plan.blocks.length : 0;
  const ratio = total ? done / total : 0;
  const plannedMinutes = plan ? plan.blocks.reduce((a, b) => a + b.minutes, 0) : 0;
  const todayCals = logs
    .filter((l) => l.date === (plan?.date ?? ''))
    .reduce((a, l) => a + l.calories, 0);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 700);
  };

  const startBlock = (block: RoutineBlock) => {
    tap('medium');
    if (block.kind === 'chore') {
      completeBlock(block.id);
      voice.speak(`Logged. ${block.minutes} minutes of real physical work, ${firstName}. That counts.`);
      return;
    }
    navigation.navigate('Player', { block });
  };

  const buildRescue = () => {
    const b = emergencyPlan(profile, rescueMin);
    addBlock(b);
    setRescueOpen(false);
    setTimeout(() => navigation.navigate('Player', { block: b }), 180);
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <LinearGradient colors={theme.gradHero} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 420 }} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
        >
          {/* Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ color: theme.textDim, fontSize: 13.5, fontWeight: '600' }}>{greet},</Text>
              <Text style={{ color: theme.text, fontSize: 27, fontWeight: '900', letterSpacing: -0.8 }}>
                {firstName}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: radius.pill,
                backgroundColor: theme.primarySoft,
              }}
            >
              <Ionicons name="flame" size={16} color={theme.primary} />
              <Text style={{ color: theme.primary, fontWeight: '900', fontSize: 14 }}>{streak}</Text>
            </View>
          </View>

          {!plan ? (
            <CheckInCard
              theme={theme}
              energy={energy}
              setEnergy={setEnergy}
              budget={budget}
              setBudget={setBudget}
              onSubmit={() => {
                tap('success');
                checkIn(energy, budget);
                voice.speak(
                  energy <= 2
                    ? `Understood ${firstName}. Low energy today, so I have made everything gentle and short.`
                    : `Great. I have built today around ${budget} minutes for you.`
                );
              }}
            />
          ) : (
            <>
              {/* Hero */}
              <FadeIn>
                <Card theme={theme} style={{ marginBottom: 16 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 18 }}>
                    <ProgressRing
                      size={116}
                      stroke={11}
                      progress={ratio}
                      theme={theme}
                      colors={ratio >= 1 ? theme.gradMint : theme.gradWarm}
                    >
                      <Text style={{ color: theme.text, fontSize: 26, fontWeight: '900', letterSpacing: -1 }}>
                        {Math.round(ratio * 100)}%
                      </Text>
                      <Text style={{ color: theme.textFaint, fontSize: 11, fontWeight: '700' }}>
                        {done}/{total} blocks
                      </Text>
                    </ProgressRing>
                    <View style={{ flex: 1 }}>
                      <Pill
                        theme={theme}
                        label={`ENERGY ${plan.energy}/5`}
                        icon="battery-half-outline"
                        color={plan.energy <= 2 ? theme.violet : theme.accent}
                      />
                      <Text
                        style={{
                          color: theme.text,
                          fontSize: 18,
                          fontWeight: '900',
                          letterSpacing: -0.4,
                          marginTop: 10,
                          lineHeight: 23,
                        }}
                      >
                        {plan.headline}
                      </Text>
                      <Text style={{ color: theme.textDim, fontSize: 13, lineHeight: 19, marginTop: 6 }}>
                        {plan.subline}
                      </Text>
                    </View>
                  </View>

                  <Pressable
                    onPress={() => {
                      tap();
                      voice.speak(
                        `${plan.headline}. ${plan.subline} ${motivationLine(streak, todayMinutes, profile.motivation)}`,
                        { force: true }
                      );
                    }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 9,
                      marginTop: 16,
                      padding: 13,
                      borderRadius: radius.md,
                      backgroundColor: theme.accentSoft,
                    }}
                  >
                    <Ionicons name="volume-high" size={17} color={theme.accent} />
                    <Text style={{ color: theme.accent, fontWeight: '800', fontSize: 13, flex: 1 }}>
                      Hear it from Coach Aarti
                    </Text>
                    <Ionicons name="play-circle" size={20} color={theme.accent} />
                  </Pressable>
                </Card>
              </FadeIn>

              {/* Stats */}
              <FadeIn delay={80}>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
                  <StatTile theme={theme} value={`${todayMinutes}`} label="Minutes moved" icon="time-outline" color={theme.primary} />
                  <StatTile theme={theme} value={`${todayCals}`} label="Calories burned" icon="flame-outline" color={theme.accent} />
                  <StatTile theme={theme} value={`${plannedMinutes}`} label="Planned today" icon="list-outline" color={theme.violet} />
                </View>
              </FadeIn>

              {/* Quick actions */}
              <FadeIn delay={120}>
                <View style={{ flexDirection: 'row', gap: 10, marginBottom: 22 }}>
                  <QuickAction
                    theme={theme}
                    icon="timer-outline"
                    label="Rescue workout"
                    sub="Got 2 min?"
                    onPress={() => {
                      tap();
                      setRescueOpen(true);
                    }}
                  />
                  <QuickAction
                    theme={theme}
                    icon="home-outline"
                    label="Log a chore"
                    sub="Counts fully"
                    onPress={() => {
                      tap();
                      setChoreOpen(true);
                    }}
                  />
                  <QuickAction
                    theme={theme}
                    icon="shuffle-outline"
                    label="Reshuffle"
                    sub="New moves"
                    onPress={() => {
                      tap();
                      regenerate();
                      voice.speak('Fresh set of moves, same time commitment.');
                    }}
                  />
                </View>
              </FadeIn>

              {/* Timeline */}
              <SectionTitle theme={theme} title="Today's routine" action="Change energy" onAction={() => {
                tap();
                setEnergy(plan.energy);
                setBudget(plan.timeBudget);
                navigation.navigate('CheckIn');
              }} />

              {plan.blocks.map((b, i) => (
                <FadeIn key={b.id} delay={140 + i * 60}>
                  <BlockCard
                    theme={theme}
                    block={b}
                    done={plan.completed.includes(b.id)}
                    onPress={() => startBlock(b)}
                  />
                </FadeIn>
              ))}

              {/* No judgement */}
              <FadeIn delay={420}>
                <Card theme={theme} style={{ marginTop: 10, backgroundColor: theme.violetSoft, borderColor: 'transparent' }}>
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <Ionicons name="heart-circle-outline" size={22} color={theme.violet} />
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.violet, fontWeight: '900', fontSize: 11.5, letterSpacing: 1 }}>
                        NO-JUDGEMENT ZONE
                      </Text>
                      <Text style={{ color: theme.text, fontSize: 14.5, lineHeight: 21, marginTop: 6, fontWeight: '600' }}>
                        {noJudge}
                      </Text>
                      <Text style={{ color: theme.textDim, fontSize: 12.5, marginTop: 8 }}>
                        {motivationLine(streak, todayMinutes, profile.motivation)}
                      </Text>
                    </View>
                  </View>
                </Card>
              </FadeIn>
            </>
          )}
        </ScrollView>
      </SafeAreaView>

      {/* Rescue modal */}
      <Modal visible={rescueOpen} transparent animationType="slide" onRequestClose={() => setRescueOpen(false)}>
        <Sheet theme={theme} onClose={() => setRescueOpen(false)} title="How many minutes do you actually have?">
          <Text style={{ color: theme.textDim, fontSize: 13.5, lineHeight: 20, marginBottom: 20 }}>
            Tell me the truth, not the ideal. I will build a silent, no-equipment circuit for exactly that window.
          </Text>
          <View style={{ flexDirection: 'row', gap: 9, marginBottom: 22 }}>
            {[2, 5, 7, 10, 15].map((m) => (
              <Pressable
                key={m}
                onPress={() => {
                  tap();
                  setRescueMin(m);
                }}
                style={{
                  flex: 1,
                  paddingVertical: 14,
                  borderRadius: radius.md,
                  alignItems: 'center',
                  backgroundColor: rescueMin === m ? theme.primary : theme.cardAlt,
                }}
              >
                <Text style={{ color: rescueMin === m ? '#fff' : theme.textDim, fontWeight: '900', fontSize: 17 }}>
                  {m}
                </Text>
                <Text style={{ color: rescueMin === m ? '#fff' : theme.textFaint, fontSize: 10.5, fontWeight: '700' }}>
                  min
                </Text>
              </Pressable>
            ))}
          </View>
          <GradientButton theme={theme} label={`Build my ${rescueMin}-minute circuit`} icon="flash" onPress={buildRescue} />
        </Sheet>
      </Modal>

      {/* Chore modal */}
      <Modal visible={choreOpen} transparent animationType="slide" onRequestClose={() => setChoreOpen(false)}>
        <ChoreSheet theme={theme} onClose={() => setChoreOpen(false)} />
      </Modal>
    </View>
  );
}

/* ---------------- Sub components ---------------- */

export function BlockCard({
  theme,
  block,
  done,
  onPress,
}: {
  theme: any;
  block: RoutineBlock;
  done: boolean;
  onPress: () => void;
}) {
  const grad = block.tint === 'mint' ? theme.gradMint : block.tint === 'violet' ? theme.gradViolet : theme.gradWarm;
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={{ transform: [{ scale }], marginBottom: 12 }}>
      <Pressable
        onPressIn={() => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start()}
        onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
        onPress={onPress}
      >
        <Card theme={theme} style={{ opacity: done ? 0.62 : 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 14 }}>
            <LinearGradient
              colors={done ? [theme.accent, theme.accent] : grad}
              style={{ width: 46, height: 46, borderRadius: 15, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name={done ? 'checkmark' : (block.icon as any)} size={22} color="#fff" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <Text style={{ color: theme.textFaint, fontSize: 11, fontWeight: '800', letterSpacing: 0.6 }}>
                  {block.timeLabel.toUpperCase()}
                </Text>
                <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: theme.textFaint }} />
                <Text style={{ color: theme.textFaint, fontSize: 11, fontWeight: '800' }}>{block.minutes} MIN</Text>
              </View>
              <Text
                style={{
                  color: theme.text,
                  fontSize: 16.5,
                  fontWeight: '800',
                  letterSpacing: -0.3,
                  textDecorationLine: done ? 'line-through' : 'none',
                }}
              >
                {block.title}
              </Text>
              <Text style={{ color: theme.textDim, fontSize: 12.5, lineHeight: 18, marginTop: 4 }}>
                {block.subtitle}
              </Text>
              {block.note && !done ? (
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 7,
                    marginTop: 10,
                    padding: 10,
                    borderRadius: 11,
                    backgroundColor: theme.cardAlt,
                  }}
                >
                  <Ionicons name="bulb-outline" size={14} color={theme.warn} />
                  <Text style={{ color: theme.textDim, fontSize: 11.5, lineHeight: 17, flex: 1 }}>{block.note}</Text>
                </View>
              ) : null}
            </View>
            <Ionicons name={done ? 'checkmark-circle' : 'chevron-forward'} size={done ? 22 : 18} color={done ? theme.accent : theme.textFaint} />
          </View>
        </Card>
      </Pressable>
    </Animated.View>
  );
}

function QuickAction({ theme, icon, label, sub, onPress }: any) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flex: 1,
        backgroundColor: pressed ? theme.cardAlt : theme.card,
        borderRadius: radius.md,
        borderWidth: 1,
        borderColor: theme.border,
        padding: 13,
      })}
    >
      <Ionicons name={icon} size={20} color={theme.primary} />
      <Text style={{ color: theme.text, fontSize: 12.5, fontWeight: '800', marginTop: 9 }}>{label}</Text>
      <Text style={{ color: theme.textFaint, fontSize: 10.5, marginTop: 2 }}>{sub}</Text>
    </Pressable>
  );
}

export function Sheet({
  theme,
  onClose,
  title,
  children,
}: {
  theme: any;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
      <Pressable style={{ flex: 1 }} onPress={onClose} />
      <View
        style={{
          backgroundColor: theme.bgElevated,
          borderTopLeftRadius: 28,
          borderTopRightRadius: 28,
          padding: 24,
          paddingBottom: 38,
        }}
      >
        <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: theme.border, alignSelf: 'center', marginBottom: 20 }} />
        <Text style={{ color: theme.text, fontSize: 20, fontWeight: '900', letterSpacing: -0.5, marginBottom: 10 }}>
          {title}
        </Text>
        {children}
      </View>
    </View>
  );
}

function ChoreSheet({ theme, onClose }: { theme: any; onClose: () => void }) {
  const { logCustom, profile } = useApp();
  const [mins, setMins] = useState(30);
  const [selected, setSelected] = useState('jhadu');
  const { CHORE_WORKOUTS } = require('../lib/exercises');
  const chore = CHORE_WORKOUTS.find((c: any) => c.key === selected);
  const cal = profile ? Math.round((chore.met * 3.5 * profile.weightKg) / 200 * mins) : 0;

  return (
    <Sheet theme={theme} onClose={onClose} title="Log household work as movement">
      <Text style={{ color: theme.textDim, fontSize: 13.5, lineHeight: 20, marginBottom: 18 }}>
        Jhadu, pocha, kneading atta — this is real physical work and it belongs in your log.
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 18 }}>
        <View style={{ flexDirection: 'row', gap: 9 }}>
          {CHORE_WORKOUTS.map((c: any) => (
            <Pressable
              key={c.key}
              onPress={() => {
                tap();
                setSelected(c.key);
              }}
              style={{
                paddingHorizontal: 14,
                paddingVertical: 11,
                borderRadius: radius.md,
                backgroundColor: selected === c.key ? theme.primary : theme.cardAlt,
                alignItems: 'center',
                minWidth: 92,
              }}
            >
              <Ionicons name={c.icon} size={18} color={selected === c.key ? '#fff' : theme.textDim} />
              <Text
                style={{
                  color: selected === c.key ? '#fff' : theme.textDim,
                  fontSize: 11,
                  fontWeight: '700',
                  marginTop: 6,
                  textAlign: 'center',
                }}
              >
                {c.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <Slider theme={theme} value={mins} min={5} max={120} step={5} onChange={setMins} tint="mint" format={(v) => `${v} minutes`} />
      <View
        style={{
          marginVertical: 18,
          padding: 14,
          borderRadius: radius.md,
          backgroundColor: theme.accentSoft,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <Ionicons name="flame" size={18} color={theme.accent} />
        <Text style={{ color: theme.text, fontSize: 13.5, fontWeight: '700', flex: 1 }}>
          Roughly {cal} calories. {chore.tip}
        </Text>
      </View>
      <GradientButton
        theme={theme}
        tint="mint"
        label="Log it"
        icon="checkmark-circle"
        onPress={() => {
          tap('success');
          logCustom(chore.label, 'chore', mins, chore.met);
          voice.speak(`Logged. ${mins} minutes of ${chore.label}. That is real work and it counts.`);
          onClose();
        }}
      />
    </Sheet>
  );
}

export function CheckInCard({
  theme,
  energy,
  setEnergy,
  budget,
  setBudget,
  onSubmit,
  compact,
}: any) {
  return (
    <Card theme={theme}>
      <Text style={{ color: theme.primary, fontSize: 11.5, fontWeight: '900', letterSpacing: 1.1 }}>
        DAILY CHECK-IN
      </Text>
      <Text style={{ color: theme.text, fontSize: 21, fontWeight: '900', letterSpacing: -0.5, marginTop: 8 }}>
        How is your energy right now?
      </Text>
      <Text style={{ color: theme.textDim, fontSize: 13.5, lineHeight: 20, marginTop: 6 }}>
        Answer honestly. A low answer gives you a gentler plan, not a lecture.
      </Text>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 20 }}>
        {ENERGY.map((e) => {
          const active = energy === e.v;
          return (
            <Pressable
              key={e.v}
              onPress={() => {
                tap();
                setEnergy(e.v);
              }}
              style={{
                flex: 1,
                alignItems: 'center',
                paddingVertical: 14,
                borderRadius: radius.md,
                borderWidth: 1.5,
                borderColor: active ? theme.primary : theme.border,
                backgroundColor: active ? theme.primarySoft : theme.cardAlt,
              }}
            >
              <Ionicons name={e.icon as any} size={20} color={active ? theme.primary : theme.textFaint} />
              <Text
                style={{
                  color: active ? theme.primary : theme.textFaint,
                  fontSize: 10.5,
                  fontWeight: '800',
                  marginTop: 6,
                }}
              >
                {e.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Text
        style={{ color: theme.textFaint, fontSize: 12, fontWeight: '800', letterSpacing: 0.8, marginTop: 24, marginBottom: 12 }}
      >
        TIME YOU CAN SPARE TODAY
      </Text>
      <Slider theme={theme} value={budget} min={5} max={60} step={5} onChange={setBudget} tint="mint" format={(v) => `${v} minutes`} />

      <GradientButton theme={theme} label="Generate today's routine" icon="sparkles" onPress={onSubmit} style={{ marginTop: 22 }} />
    </Card>
  );
}
