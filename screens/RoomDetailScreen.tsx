import React, { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../lib/AppContext';
import { radius } from '../lib/theme';
import { Card, FadeIn, GradientButton, Pill } from '../components/ui';
import { ROOMS } from '../lib/exercises';
import { eligible } from '../lib/engine';
import { RoutineBlock } from '../lib/types';
import { tap } from '../lib/haptics';
import { voice } from '../lib/voice';

export default function RoomDetailScreen({ route, navigation }: any) {
  const { roomKey } = route.params;
  const { theme, profile, addBlock } = useApp();
  const room = ROOMS.find((r) => r.key === roomKey)!;

  const moves = useMemo(() => {
    if (!profile) return [];
    return eligible(profile).filter((e) => e.room.includes(roomKey));
  }, [profile, roomKey]);

  const anywhere = useMemo(() => {
    if (!profile) return [];
    return eligible(profile).filter((e) => e.room.includes('anywhere') && !e.room.includes(roomKey));
  }, [profile, roomKey]);

  if (!profile) return null;

  const grad = room.tint === 'mint' ? theme.gradMint : room.tint === 'violet' ? theme.gradViolet : theme.gradWarm;
  const all = [...moves, ...anywhere];

  const buildRoomWorkout = () => {
    const picks = all.slice(0, Math.min(6, all.length));
    const block: RoutineBlock = {
      id: `room-${roomKey}-${Date.now()}`,
      title: `${room.label} Circuit`,
      subtitle: `${picks.length} moves you can do in the ${room.label.toLowerCase()}`,
      slot: 'now',
      timeLabel: 'Right now',
      kind: 'workout',
      minutes: Math.max(4, Math.round((picks.length * 55) / 60)),
      icon: room.icon,
      tint: room.tint,
      items: picks.map((e, i) => ({
        id: `${e.id}-${i}`,
        exerciseId: e.id,
        name: e.name,
        hindi: e.hindi,
        seconds: 40,
        reps: e.reps,
        cue: e.cue,
        easier: e.easier,
        harder: e.harder,
      })),
      note: room.hacks[0],
    };
    tap('medium');
    addBlock(block);
    navigation.navigate('Player', { block });
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={{ paddingBottom: 34 }} showsVerticalScrollIndicator={false}>
          <LinearGradient colors={grad} style={{ padding: 22, paddingTop: 16, paddingBottom: 30 }}>
            <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={{ marginBottom: 18 }}>
              <Ionicons name="chevron-back" size={26} color="#fff" />
            </Pressable>
            <Ionicons name={room.icon as any} size={32} color="#fff" />
            <Text style={{ color: '#fff', fontSize: 30, fontWeight: '900', letterSpacing: -0.9, marginTop: 14 }}>
              {room.label}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13.5, fontWeight: '700', marginTop: 3 }}>
              {room.hindi}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.92)', fontSize: 14, lineHeight: 21, marginTop: 12 }}>
              {room.blurb}
            </Text>
          </LinearGradient>

          <View style={{ padding: 20, marginTop: -16 }}>
            <FadeIn>
              <Card theme={theme}>
                <Text style={{ color: theme.primary, fontSize: 11.5, fontWeight: '900', letterSpacing: 1 }}>
                  ROOM HACKS
                </Text>
                {room.hacks.map((h, i) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 10, marginTop: 13 }}>
                    <Ionicons name="sparkles" size={15} color={theme.accent} style={{ marginTop: 2 }} />
                    <Text style={{ color: theme.textDim, fontSize: 13.5, lineHeight: 20, flex: 1 }}>{h}</Text>
                  </View>
                ))}
              </Card>
            </FadeIn>

            <View style={{ marginTop: 20, marginBottom: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ color: theme.text, fontSize: 18, fontWeight: '900', letterSpacing: -0.3 }}>
                Your unlocked moves
              </Text>
              <Pill theme={theme} label={`${all.length}`} />
            </View>

            {all.length === 0 ? (
              <Card theme={theme}>
                <Text style={{ color: theme.textDim, fontSize: 13.5, lineHeight: 20 }}>
                  Nothing here matches your current equipment and limitations. Update your profile to unlock more.
                </Text>
              </Card>
            ) : (
              all.map((e, i) => (
                <FadeIn key={e.id} delay={40 + i * 35}>
                  <Card theme={theme} style={{ marginBottom: 10 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                      <View
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 12,
                          backgroundColor: theme.cardAlt,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Ionicons
                          name={
                            e.type === 'cardio'
                              ? 'heart-outline'
                              : e.type === 'strength'
                              ? 'barbell-outline'
                              : e.type === 'core'
                              ? 'body-outline'
                              : e.type === 'breath'
                              ? 'cloud-outline'
                              : 'accessibility-outline'
                          }
                          size={18}
                          color={theme.primary}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: theme.text, fontSize: 15, fontWeight: '800' }}>{e.name}</Text>
                        <Text style={{ color: theme.textFaint, fontSize: 11.5, marginTop: 2 }}>
                          {e.hindi} · {e.targets}
                        </Text>
                        <Text style={{ color: theme.textDim, fontSize: 12.5, lineHeight: 18, marginTop: 7 }}>
                          {e.cue}
                        </Text>
                        <View style={{ flexDirection: 'row', gap: 7, marginTop: 9, flexWrap: 'wrap' }}>
                          <Pill theme={theme} label={`${e.seconds}s`} color={theme.textDim} />
                          {e.impact === 'zero' ? (
                            <Pill theme={theme} label="Silent" color={theme.accent} icon="volume-mute-outline" />
                          ) : null}
                          {e.equipment.length === 0 ? (
                            <Pill theme={theme} label="No equipment" color={theme.violet} />
                          ) : null}
                        </View>
                      </View>
                      <Pressable
                        onPress={() => {
                          tap();
                          voice.speak(`${e.name}. ${e.cue}`, { force: true });
                        }}
                        hitSlop={10}
                      >
                        <Ionicons name="volume-medium-outline" size={19} color={theme.textFaint} />
                      </Pressable>
                    </View>
                  </Card>
                </FadeIn>
              ))
            )}
          </View>
        </ScrollView>

        {all.length > 0 ? (
          <View style={{ padding: 20, paddingTop: 0 }}>
            <GradientButton
              theme={theme}
              tint={room.tint}
              label={`Do a ${room.label} circuit now`}
              icon="play"
              onPress={buildRoomWorkout}
            />
          </View>
        ) : null}
      </SafeAreaView>
    </View>
  );
}
