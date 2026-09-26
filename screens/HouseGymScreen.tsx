import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../lib/AppContext';
import { radius } from '../lib/theme';
import { Card, FadeIn, Pill, SectionTitle } from '../components/ui';
import { CHORE_WORKOUTS, ROOMS, SUBSTITUTES } from '../lib/exercises';
import { eligible } from '../lib/engine';
import { tap } from '../lib/haptics';
import { voice } from '../lib/voice';

export default function HouseGymScreen({ navigation }: any) {
  const { theme, profile, logCustom } = useApp();
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<'rooms' | 'swaps' | 'chores'>('rooms');

  if (!profile) return null;

  const available = useMemo(() => eligible(profile), [profile]);

  const tabs = [
    { key: 'rooms', label: 'Rooms', icon: 'home-outline' },
    { key: 'swaps', label: 'Gear swaps', icon: 'swap-horizontal-outline' },
    { key: 'chores', label: 'Chore burn', icon: 'brush-outline' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <LinearGradient colors={theme.gradHero} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 320 }} />
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
            <Text style={{ color: theme.primary, fontSize: 11.5, fontWeight: '900', letterSpacing: 1.2 }}>
              THE SIGNATURE FEATURE
            </Text>
            <Text style={{ color: theme.text, fontSize: 30, fontWeight: '900', letterSpacing: -1, marginTop: 8, lineHeight: 35 }}>
              Turn Your House{'\n'}Into Your Gym
            </Text>
            <Text style={{ color: theme.textDim, fontSize: 14.5, lineHeight: 21, marginTop: 10 }}>
              You do not need a membership. You need a wall, a chair, two bottles and a staircase — and you already
              have all four.
            </Text>
          </FadeIn>

          <FadeIn delay={80}>
            <View style={{ flexDirection: 'row', gap: 9, marginTop: 22, marginBottom: 20 }}>
              {tabs.map((t) => (
                <Pressable
                  key={t.key}
                  onPress={() => {
                    tap();
                    setTab(t.key as any);
                  }}
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    paddingVertical: 11,
                    borderRadius: radius.pill,
                    backgroundColor: tab === t.key ? theme.primary : theme.card,
                    borderWidth: 1,
                    borderColor: tab === t.key ? theme.primary : theme.border,
                  }}
                >
                  <Ionicons name={t.icon as any} size={15} color={tab === t.key ? '#fff' : theme.textDim} />
                  <Text style={{ color: tab === t.key ? '#fff' : theme.textDim, fontWeight: '800', fontSize: 12.5 }}>
                    {t.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </FadeIn>

          {tab === 'rooms' ? (
            <>
              {ROOMS.map((room, i) => {
                const count = available.filter((e) => e.room.includes(room.key) || e.room.includes('anywhere')).length;
                const grad =
                  room.tint === 'mint' ? theme.gradMint : room.tint === 'violet' ? theme.gradViolet : theme.gradWarm;
                return (
                  <FadeIn key={room.key} delay={100 + i * 55}>
                    <Pressable
                      onPress={() => {
                        tap();
                        navigation.navigate('Room', { roomKey: room.key });
                      }}
                    >
                      <Card theme={theme} style={{ marginBottom: 12 }}>
                        <View style={{ flexDirection: 'row', gap: 14 }}>
                          <LinearGradient
                            colors={grad}
                            style={{ width: 52, height: 52, borderRadius: 17, alignItems: 'center', justifyContent: 'center' }}
                          >
                            <Ionicons name={room.icon as any} size={24} color="#fff" />
                          </LinearGradient>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                              <Text style={{ color: theme.text, fontSize: 17, fontWeight: '900', letterSpacing: -0.3 }}>
                                {room.label}
                              </Text>
                              <Text style={{ color: theme.textFaint, fontSize: 12, fontWeight: '600' }}>
                                {room.hindi}
                              </Text>
                            </View>
                            <Text style={{ color: theme.textDim, fontSize: 12.8, lineHeight: 19, marginTop: 5 }}>
                              {room.blurb}
                            </Text>
                            <View style={{ flexDirection: 'row', marginTop: 10 }}>
                              <Pill theme={theme} label={`${count} moves unlocked`} icon="checkmark-circle-outline" />
                            </View>
                          </View>
                          <Ionicons name="chevron-forward" size={18} color={theme.textFaint} />
                        </View>
                      </Card>
                    </Pressable>
                  </FadeIn>
                );
              })}
            </>
          ) : null}

          {tab === 'swaps' ? (
            <>
              <Card theme={theme} style={{ marginBottom: 16, backgroundColor: theme.accentSoft, borderColor: 'transparent' }}>
                <Text style={{ color: theme.text, fontSize: 14.5, lineHeight: 21, fontWeight: '600' }}>
                  Every piece of gym equipment has a free version sitting in your house right now. Here is the full
                  translation table.
                </Text>
              </Card>
              {SUBSTITUTES.map((s, i) => (
                <FadeIn key={s.have} delay={60 + i * 40}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      backgroundColor: theme.card,
                      borderRadius: radius.md,
                      borderWidth: 1,
                      borderColor: theme.border,
                      padding: 15,
                      marginBottom: 10,
                    }}
                  >
                    <View
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: 12,
                        backgroundColor: theme.primarySoft,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name={s.icon as any} size={18} color={theme.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.text, fontWeight: '800', fontSize: 14 }}>{s.have}</Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 3 }}>
                        <Ionicons name="arrow-forward" size={11} color={theme.accent} />
                        <Text style={{ color: theme.accent, fontSize: 12.5, fontWeight: '700' }}>{s.instead}</Text>
                      </View>
                    </View>
                  </View>
                </FadeIn>
              ))}
            </>
          ) : null}

          {tab === 'chores' ? (
            <>
              <Card theme={theme} style={{ marginBottom: 16, backgroundColor: theme.violetSoft, borderColor: 'transparent' }}>
                <Text style={{ color: theme.text, fontSize: 14.5, lineHeight: 21, fontWeight: '600' }}>
                  Housework is not "less than" exercise. Two hours of jhadu-pocha burns more than most gym sessions.
                  Tap any of these to log it instantly.
                </Text>
              </Card>
              {CHORE_WORKOUTS.map((c, i) => {
                const cal30 = Math.round((c.met * 3.5 * profile.weightKg) / 200 * 30);
                return (
                  <FadeIn key={c.key} delay={60 + i * 40}>
                    <Pressable
                      onPress={() => {
                        tap('success');
                        logCustom(c.label, 'chore', 30, c.met);
                        voice.speak(`Logged 30 minutes of ${c.label}. Roughly ${cal30} calories. That is real work.`);
                      }}
                    >
                      <Card theme={theme} style={{ marginBottom: 10 }}>
                        <View style={{ flexDirection: 'row', gap: 13, alignItems: 'flex-start' }}>
                          <View
                            style={{
                              width: 42,
                              height: 42,
                              borderRadius: 14,
                              backgroundColor: theme.violetSoft,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Ionicons name={c.icon as any} size={20} color={theme.violet} />
                          </View>
                          <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                              <Text style={{ color: theme.text, fontSize: 15, fontWeight: '800' }}>{c.label}</Text>
                              <Text style={{ color: theme.primary, fontSize: 12.5, fontWeight: '900' }}>
                                {cal30} cal / 30 min
                              </Text>
                            </View>
                            <Text style={{ color: theme.textDim, fontSize: 12.5, lineHeight: 18, marginTop: 5 }}>
                              {c.tip}
                            </Text>
                            <View
                              style={{
                                flexDirection: 'row',
                                gap: 7,
                                marginTop: 9,
                                padding: 9,
                                borderRadius: 10,
                                backgroundColor: theme.cardAlt,
                              }}
                            >
                              <Ionicons name="trending-up" size={13} color={theme.accent} />
                              <Text style={{ color: theme.textDim, fontSize: 11.5, flex: 1, lineHeight: 16 }}>
                                Level up: {c.upgrade}
                              </Text>
                            </View>
                            <Text style={{ color: theme.textFaint, fontSize: 11, marginTop: 8, fontWeight: '700' }}>
                              Tap to log 30 minutes
                            </Text>
                          </View>
                        </View>
                      </Card>
                    </Pressable>
                  </FadeIn>
                );
              })}
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
