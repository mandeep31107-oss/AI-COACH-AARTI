import React, { useMemo, useState } from 'react';
import { Dimensions, Modal, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../lib/AppContext';
import { radius } from '../lib/theme';
import { Card, EmptyState, FadeIn, GradientButton, Pill, SectionTitle, StatTile } from '../components/ui';
import { BarChart, Donut, Heatmap, LineChart, ProgressRing } from '../components/charts';
import { Slider } from '../components/Slider';
import { badges } from '../lib/coach';
import { bmi, bmiBand, dateKeyOffset, todayKey } from '../lib/engine';
import { Sheet } from './TodayScreen';
import { tap } from '../lib/haptics';

const W = Dimensions.get('window').width;

export default function ProgressScreen() {
  const { theme, logs, profile, streak, weights, addWeight } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [weightOpen, setWeightOpen] = useState(false);
  const [newWeight, setNewWeight] = useState(profile?.weightKg ?? 65);

  if (!profile) return null;

  const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  const week = useMemo(() => {
    const out: { key: string; minutes: number; label: string }[] = [];
    for (let i = 6; i >= 0; i--) {
      const key = dateKeyOffset(-i);
      const d = new Date(key);
      out.push({
        key,
        minutes: logs.filter((l) => l.date === key).reduce((a, l) => a + l.minutes, 0),
        label: dayLabels[d.getDay()],
      });
    }
    return out;
  }, [logs]);

  const last42 = useMemo(() => {
    const out: { date: string; minutes: number }[] = [];
    for (let i = 41; i >= 0; i--) {
      const key = dateKeyOffset(-i);
      out.push({ date: key, minutes: logs.filter((l) => l.date === key).reduce((a, l) => a + l.minutes, 0) });
    }
    return out;
  }, [logs]);

  const totalMinutes = logs.reduce((a, l) => a + l.minutes, 0);
  const totalCals = logs.reduce((a, l) => a + l.calories, 0);
  const activeDays = new Set(logs.map((l) => l.date)).size;
  const weeklyTotal = week.reduce((a, d) => a + d.minutes, 0);
  const weeklyGoal = 150;

  const mix = useMemo(() => {
    const g = (k: string) => logs.filter((l) => l.kind === k).reduce((a, l) => a + l.minutes, 0);
    return [
      { value: g('workout'), color: theme.primary, label: 'Home workouts' },
      { value: g('chore'), color: theme.violet, label: 'Household work' },
      { value: g('mobility'), color: theme.accent, label: 'Mobility & wind-down' },
      { value: g('micro'), color: theme.warn, label: 'Micro-movements' },
    ].filter((s) => s.value > 0);
  }, [logs, theme]);

  const allBadges = badges(logs, streak);
  const earned = allBadges.filter((b) => b.earned).length;
  const b = bmi(profile);
  const band = bmiBand(b);

  const weightPoints = weights.length >= 2 ? weights.slice(-12).map((w) => w.kg) : [];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <LinearGradient colors={theme.gradHero} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 300 }} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                setTimeout(() => setRefreshing(false), 700);
              }}
              tintColor={theme.primary}
            />
          }
        >
          <FadeIn>
            <Text style={{ color: theme.text, fontSize: 28, fontWeight: '900', letterSpacing: -0.9 }}>Progress</Text>
            <Text style={{ color: theme.textDim, fontSize: 13.5, marginTop: 5 }}>
              We measure consistency, not perfection.
            </Text>
          </FadeIn>

          {logs.length === 0 ? (
            <Card theme={theme} style={{ marginTop: 22 }}>
              <EmptyState
                theme={theme}
                icon="bar-chart-outline"
                title="Nothing logged yet"
                body="Complete any block on the Today tab — or just log your jhadu-pocha — and your dashboard fills up instantly."
              />
            </Card>
          ) : null}

          {/* Weekly ring */}
          <FadeIn delay={70}>
            <Card theme={theme} style={{ marginTop: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                <ProgressRing size={124} stroke={12} progress={weeklyTotal / weeklyGoal} theme={theme} colors={theme.gradMint}>
                  <Text style={{ color: theme.text, fontSize: 25, fontWeight: '900', letterSpacing: -1 }}>
                    {weeklyTotal}
                  </Text>
                  <Text style={{ color: theme.textFaint, fontSize: 10.5, fontWeight: '800' }}>OF {weeklyGoal} MIN</Text>
                </ProgressRing>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.text, fontSize: 17, fontWeight: '900', letterSpacing: -0.3 }}>
                    This week
                  </Text>
                  <Text style={{ color: theme.textDim, fontSize: 13, lineHeight: 19, marginTop: 6 }}>
                    {weeklyTotal >= weeklyGoal
                      ? 'You have crossed the WHO weekly movement target. Genuinely impressive.'
                      : `${Math.max(0, weeklyGoal - weeklyTotal)} minutes to hit the WHO weekly target. Chores count towards it.`}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 7, marginTop: 12, flexWrap: 'wrap' }}>
                    <Pill theme={theme} label={`${streak} day streak`} icon="flame-outline" color={theme.primary} />
                    <Pill theme={theme} label={`${activeDays} active days`} icon="calendar-outline" />
                  </View>
                </View>
              </View>
            </Card>
          </FadeIn>

          {/* Stats */}
          <FadeIn delay={120}>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
              <StatTile theme={theme} value={`${totalMinutes}`} label="Total minutes" icon="time-outline" color={theme.primary} />
              <StatTile theme={theme} value={`${totalCals}`} label="Calories burned" icon="flame-outline" color={theme.accent} />
              <StatTile theme={theme} value={`${logs.length}`} label="Sessions" icon="checkmark-done-outline" color={theme.violet} />
            </View>
          </FadeIn>

          {/* Bar chart */}
          <FadeIn delay={170}>
            <Card theme={theme} style={{ marginTop: 18 }}>
              <SectionTitle theme={theme} title="Last 7 days" />
              <BarChart
                data={week.map((d) => d.minutes)}
                labels={week.map((d) => d.label)}
                theme={theme}
                width={W - 40 - 36}
                height={140}
              />
            </Card>
          </FadeIn>

          {/* Mix donut */}
          {mix.length > 0 ? (
            <FadeIn delay={210}>
              <Card theme={theme} style={{ marginTop: 14 }}>
                <SectionTitle theme={theme} title="Where your movement comes from" />
                <Donut slices={mix} theme={theme} size={124} />
                <Text style={{ color: theme.textFaint, fontSize: 12, lineHeight: 18, marginTop: 14 }}>
                  Household work is counted at its real metabolic value. It is not a consolation prize.
                </Text>
              </Card>
            </FadeIn>
          ) : null}

          {/* Heatmap */}
          <FadeIn delay={250}>
            <Card theme={theme} style={{ marginTop: 14 }}>
              <SectionTitle theme={theme} title="Consistency map" />
              <Text style={{ color: theme.textFaint, fontSize: 12, marginBottom: 14 }}>Last 6 weeks</Text>
              <Heatmap days={last42} theme={theme} columns={14} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginTop: 14 }}>
                <Text style={{ color: theme.textFaint, fontSize: 11 }}>Less</Text>
                {[0.25, 0.5, 0.75, 1].map((o) => (
                  <View key={o} style={{ width: 13, height: 13, borderRadius: 4, backgroundColor: theme.accent, opacity: o }} />
                ))}
                <Text style={{ color: theme.textFaint, fontSize: 11 }}>More</Text>
              </View>
            </Card>
          </FadeIn>

          {/* Body stats */}
          <FadeIn delay={290}>
            <Card theme={theme} style={{ marginTop: 14 }}>
              <SectionTitle theme={theme} title="Body stats" action="Log weight" onAction={() => {
                tap();
                setNewWeight(profile.weightKg);
                setWeightOpen(true);
              }} />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.textFaint, fontSize: 11.5, fontWeight: '800', letterSpacing: 0.6 }}>
                    CURRENT WEIGHT
                  </Text>
                  <Text style={{ color: theme.text, fontSize: 28, fontWeight: '900', letterSpacing: -1, marginTop: 4 }}>
                    {profile.weightKg} <Text style={{ fontSize: 15 }}>kg</Text>
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.textFaint, fontSize: 11.5, fontWeight: '800', letterSpacing: 0.6 }}>
                    BMI (ASIAN SCALE)
                  </Text>
                  <Text style={{ color: band.color, fontSize: 28, fontWeight: '900', letterSpacing: -1, marginTop: 4 }}>
                    {b}
                  </Text>
                  <Text style={{ color: band.color, fontSize: 11.5, fontWeight: '700' }}>{band.label}</Text>
                </View>
              </View>
              {weightPoints.length >= 2 ? (
                <View style={{ marginTop: 18 }}>
                  <LineChart points={weightPoints} theme={theme} width={W - 40 - 36} height={110} color={theme.violet} />
                </View>
              ) : (
                <Text style={{ color: theme.textFaint, fontSize: 12, lineHeight: 18, marginTop: 14 }}>
                  Log your weight twice and a trend line appears here. Weekly is enough — daily weighing just creates
                  noise and anxiety.
                </Text>
              )}
            </Card>
          </FadeIn>

          {/* Badges */}
          <FadeIn delay={330}>
            <Card theme={theme} style={{ marginTop: 14 }}>
              <SectionTitle theme={theme} title={`Badges · ${earned}/${allBadges.length}`} />
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {allBadges.map((bd) => (
                  <View
                    key={bd.key}
                    style={{
                      width: (W - 40 - 36 - 20) / 3,
                      alignItems: 'center',
                      paddingVertical: 14,
                      borderRadius: radius.md,
                      backgroundColor: bd.earned ? theme.primarySoft : theme.cardAlt,
                      opacity: bd.earned ? 1 : 0.55,
                    }}
                  >
                    <Ionicons name={bd.icon as any} size={22} color={bd.earned ? theme.primary : theme.textFaint} />
                    <Text
                      style={{
                        color: bd.earned ? theme.text : theme.textFaint,
                        fontSize: 11,
                        fontWeight: '800',
                        marginTop: 7,
                        textAlign: 'center',
                      }}
                    >
                      {bd.label}
                    </Text>
                    <Text style={{ color: theme.textFaint, fontSize: 9.5, textAlign: 'center', marginTop: 2 }}>
                      {bd.desc}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          </FadeIn>

          {/* Recent */}
          {logs.length > 0 ? (
            <FadeIn delay={370}>
              <Card theme={theme} style={{ marginTop: 14 }}>
                <SectionTitle theme={theme} title="Recent activity" />
                {logs.slice(0, 12).map((l) => (
                  <View
                    key={l.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      paddingVertical: 11,
                      borderBottomWidth: 1,
                      borderBottomColor: theme.border,
                    }}
                  >
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 11,
                        backgroundColor:
                          l.kind === 'chore' ? theme.violetSoft : l.kind === 'workout' ? theme.primarySoft : theme.accentSoft,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons
                        name={l.kind === 'chore' ? 'home-outline' : l.kind === 'workout' ? 'flame-outline' : 'leaf-outline'}
                        size={15}
                        color={l.kind === 'chore' ? theme.violet : l.kind === 'workout' ? theme.primary : theme.accent}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.text, fontSize: 13.5, fontWeight: '700' }}>{l.title}</Text>
                      <Text style={{ color: theme.textFaint, fontSize: 11, marginTop: 2 }}>
                        {l.date === todayKey() ? 'Today' : l.date} · {l.minutes} min
                      </Text>
                    </View>
                    <Text style={{ color: theme.accent, fontSize: 12.5, fontWeight: '800' }}>{l.calories} cal</Text>
                  </View>
                ))}
              </Card>
            </FadeIn>
          ) : null}
        </ScrollView>
      </SafeAreaView>

      <Modal visible={weightOpen} transparent animationType="slide" onRequestClose={() => setWeightOpen(false)}>
        <Sheet theme={theme} onClose={() => setWeightOpen(false)} title="Log today's weight">
          <Text style={{ color: theme.textDim, fontSize: 13.5, lineHeight: 20, marginBottom: 20 }}>
            Weigh yourself in the morning, before eating, once a week. The trend matters, never a single number.
          </Text>
          <Slider theme={theme} value={newWeight} min={35} max={160} step={0.5} onChange={setNewWeight} tint="violet" format={(v) => `${v} kg`} />
          <GradientButton
            theme={theme}
            tint="violet"
            label="Save"
            icon="checkmark"
            style={{ marginTop: 22 }}
            onPress={() => {
              tap('success');
              addWeight(newWeight);
              setWeightOpen(false);
            }}
          />
        </Sheet>
      </Modal>
    </View>
  );
}
