import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../lib/AppContext';
import { radius } from '../lib/theme';
import { Card, FadeIn, GhostButton, GradientButton, Pill } from '../components/ui';
import { ProgressRing } from '../components/charts';
import { RoutineBlock } from '../lib/types';
import { voice } from '../lib/voice';
import { tap } from '../lib/haptics';

const REST = 15;

export default function WorkoutPlayerScreen({ route, navigation }: any) {
  const block: RoutineBlock = route.params.block;
  const { theme, completeBlock, profile, settings } = useApp();

  const [idx, setIdx] = useState(0);
  const [phase, setPhase] = useState<'ready' | 'work' | 'rest' | 'done'>('ready');
  const [left, setLeft] = useState(block.items[0]?.seconds ?? 30);
  const [paused, setPaused] = useState(false);
  const [difficulty, setDifficulty] = useState<'normal' | 'easier' | 'harder'>('normal');
  const timerRef = useRef<any>(null);
  const pulse = useRef(new Animated.Value(1)).current;

  const item = block.items[idx];
  const totalItems = block.items.length;
  const firstName = profile?.name.split(' ')[0] || 'friend';

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.05, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1100, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      voice.stop();
    };
  }, []);

  useEffect(() => {
    if (phase !== 'work' && phase !== 'rest') return;
    if (paused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setLeft((l) => Math.max(0, l - 1));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase, paused, idx]);

  useEffect(() => {
    if (phase !== 'work' && phase !== 'rest') return;
    if (left === 0) {
      if (timerRef.current) clearInterval(timerRef.current);
      advance();
    }
  }, [left, phase]);

  const advance = () => {
    tap('medium');
    if (phase === 'work') {
      if (idx === totalItems - 1) {
        finish();
      } else {
        setPhase('rest');
        setLeft(REST);
        const nextItem = block.items[idx + 1];
        voice.speak(`Nice. Rest ${REST} seconds. Next up, ${nextItem.name}.`);
      }
    } else if (phase === 'rest') {
      const n = idx + 1;
      setIdx(n);
      setPhase('work');
      setLeft(block.items[n].seconds);
      voice.speak(`${block.items[n].name}. ${block.items[n].cue}`);
    }
  };

  const startWorkout = () => {
    tap('medium');
    setPhase('work');
    setLeft(block.items[0].seconds);
    voice.speak(`Let us go ${firstName}. First move, ${block.items[0].name}. ${block.items[0].cue}`);
  };

  const finish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase('done');
    completeBlock(block.id);
    tap('success');
    voice.speak(
      `Done ${firstName}. ${block.minutes} minutes logged. You did not need a gym, a trainer or perfect conditions. Just this.`
    );
  };

  const skipItem = () => {
    tap();
    if (idx === totalItems - 1) finish();
    else {
      const n = idx + 1;
      setIdx(n);
      setPhase('work');
      setLeft(block.items[n].seconds);
      voice.speak(`Skipped, no problem. ${block.items[n].name}.`);
    }
  };

  const grad = block.tint === 'mint' ? theme.gradMint : block.tint === 'violet' ? theme.gradViolet : theme.gradWarm;

  /* ---------------- READY ---------------- */
  if (phase === 'ready') {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <LinearGradient colors={theme.gradHero} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 320 }} />
        <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
          <Header theme={theme} title="Ready?" onClose={() => navigation.goBack()} />
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
            <FadeIn>
              <LinearGradient colors={grad} style={{ borderRadius: radius.lg, padding: 22, marginBottom: 18 }}>
                <Ionicons name={block.icon as any} size={30} color="#fff" />
                <Text style={{ color: '#fff', fontSize: 25, fontWeight: '900', letterSpacing: -0.6, marginTop: 14 }}>
                  {block.title}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.88)', fontSize: 13.5, lineHeight: 20, marginTop: 8 }}>
                  {block.subtitle}
                </Text>
                <View style={{ flexDirection: 'row', gap: 18, marginTop: 18 }}>
                  <MiniStat label="Minutes" value={`${block.minutes}`} />
                  <MiniStat label="Moves" value={`${totalItems}`} />
                  <MiniStat label="Space" value="1 mat" />
                  <MiniStat label="Noise" value="Zero" />
                </View>
              </LinearGradient>
            </FadeIn>

            {block.note ? (
              <FadeIn delay={70}>
                <Card theme={theme} style={{ marginBottom: 18, backgroundColor: theme.accentSoft, borderColor: 'transparent' }}>
                  <View style={{ flexDirection: 'row', gap: 10 }}>
                    <Ionicons name="bulb-outline" size={18} color={theme.accent} />
                    <Text style={{ color: theme.text, fontSize: 13.5, lineHeight: 20, flex: 1 }}>{block.note}</Text>
                  </View>
                </Card>
              </FadeIn>
            ) : null}

            <Text style={{ color: theme.text, fontSize: 17, fontWeight: '800', marginBottom: 12 }}>The moves</Text>
            {block.items.map((it, i) => (
              <FadeIn key={it.id} delay={90 + i * 45}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                    paddingVertical: 13,
                    borderBottomWidth: 1,
                    borderBottomColor: theme.border,
                  }}
                >
                  <View
                    style={{
                      width: 30,
                      height: 30,
                      borderRadius: 10,
                      backgroundColor: theme.cardAlt,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ color: theme.textDim, fontWeight: '900', fontSize: 12 }}>{i + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.text, fontWeight: '700', fontSize: 14.5 }}>{it.name}</Text>
                    <Text style={{ color: theme.textFaint, fontSize: 11.5, marginTop: 2 }}>
                      {it.hindi} · {it.reps || `${it.seconds}s`}
                    </Text>
                  </View>
                  <Text style={{ color: theme.textFaint, fontSize: 12, fontWeight: '700' }}>{it.seconds}s</Text>
                </View>
              </FadeIn>
            ))}
          </ScrollView>
          <View style={{ padding: 20, paddingTop: 8 }}>
            <GradientButton
              theme={theme}
              tint={block.tint}
              label="Start · I am ready"
              icon="play"
              onPress={startWorkout}
            />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  /* ---------------- DONE ---------------- */
  if (phase === 'done') {
    return (
      <View style={{ flex: 1, backgroundColor: theme.bg }}>
        <LinearGradient colors={theme.gradHero} style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }} />
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: 26 }} edges={['top', 'bottom']}>
          <FadeIn>
            <View style={{ alignItems: 'center' }}>
              <LinearGradient
                colors={theme.gradMint}
                style={{ width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name="checkmark" size={46} color="#fff" />
              </LinearGradient>
              <Text style={{ color: theme.text, fontSize: 29, fontWeight: '900', letterSpacing: -0.9, marginTop: 24, textAlign: 'center' }}>
                That is done, {firstName}.
              </Text>
              <Text style={{ color: theme.textDim, fontSize: 14.5, lineHeight: 22, textAlign: 'center', marginTop: 12 }}>
                No gym. No trainer. No perfect conditions. You moved inside your own home, and that is the only thing
                that actually compounds.
              </Text>
            </View>
          </FadeIn>

          <FadeIn delay={140}>
            <Card theme={theme} style={{ marginTop: 30 }}>
              <View style={{ flexDirection: 'row' }}>
                <ResultStat theme={theme} value={`${block.minutes}`} label="minutes" />
                <ResultStat theme={theme} value={`${totalItems}`} label="moves" />
                <ResultStat
                  theme={theme}
                  value={`${profile ? Math.round((5.2 * 3.5 * profile.weightKg) / 200 * block.minutes) : 0}`}
                  label="calories"
                />
              </View>
            </Card>
          </FadeIn>

          <FadeIn delay={220}>
            <View style={{ marginTop: 26, gap: 10 }}>
              <GradientButton theme={theme} tint="mint" label="Back to today" icon="home" onPress={() => navigation.goBack()} />
              <GhostButton
                theme={theme}
                label="Hear a word from Coach Aarti"
                icon="volume-high"
                onPress={() =>
                  voice.speak(
                    `${firstName}, you showed up on a day you could have skipped. That is the whole game. Same time tomorrow, even if it is only two minutes.`,
                    { force: true }
                  )
                }
              />
            </View>
          </FadeIn>
        </SafeAreaView>
      </View>
    );
  }

  /* ---------------- WORK / REST ---------------- */
  const duration = phase === 'work' ? item.seconds : REST;
  const progress = 1 - left / duration;
  const nextItem = block.items[Math.min(totalItems - 1, idx + 1)];

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <LinearGradient
        colors={phase === 'rest' ? [theme.bg, theme.bgElevated, theme.bg] : theme.gradHero}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, bottom: 0 }}
      />
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        <Header
          theme={theme}
          title={`${idx + 1} of ${totalItems}`}
          onClose={() => {
            voice.stop();
            navigation.goBack();
          }}
        />

        <View style={{ paddingHorizontal: 20 }}>
          <View style={{ flexDirection: 'row', gap: 5 }}>
            {block.items.map((_, i) => (
              <View
                key={i}
                style={{
                  flex: 1,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: i < idx ? theme.accent : i === idx ? theme.primary : theme.cardAlt,
                }}
              />
            ))}
          </View>
        </View>

        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <Pill
            theme={theme}
            label={phase === 'rest' ? 'REST' : difficulty === 'easier' ? 'EASIER VERSION' : difficulty === 'harder' ? 'HARDER VERSION' : 'WORK'}
            color={phase === 'rest' ? theme.violet : theme.primary}
            icon={phase === 'rest' ? 'cafe-outline' : 'flame-outline'}
          />

          <Animated.View style={{ transform: [{ scale: phase === 'work' && !paused ? pulse : 1 }], marginVertical: 26 }}>
            <ProgressRing
              size={236}
              stroke={16}
              progress={progress}
              theme={theme}
              colors={phase === 'rest' ? theme.gradViolet : grad}
            >
              <Text style={{ color: theme.text, fontSize: 60, fontWeight: '900', letterSpacing: -2.5 }}>{left}</Text>
              <Text style={{ color: theme.textFaint, fontSize: 12, fontWeight: '800', letterSpacing: 1 }}>SECONDS</Text>
            </ProgressRing>
          </Animated.View>

          {phase === 'work' ? (
            <>
              <Text style={{ color: theme.text, fontSize: 25, fontWeight: '900', letterSpacing: -0.7, textAlign: 'center' }}>
                {item.name}
              </Text>
              <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '700', marginTop: 5 }}>
                {item.hindi}
                {item.reps ? ` · ${item.reps}` : ''}
              </Text>
              <Text
                style={{ color: theme.textDim, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 14 }}
              >
                {difficulty === 'easier' ? item.easier : difficulty === 'harder' ? item.harder : item.cue}
              </Text>
            </>
          ) : (
            <>
              <Text style={{ color: theme.text, fontSize: 22, fontWeight: '900', letterSpacing: -0.5 }}>
                Breathe. Shake it out.
              </Text>
              <Text style={{ color: theme.textDim, fontSize: 14, marginTop: 10, textAlign: 'center' }}>
                Coming up: <Text style={{ color: theme.primary, fontWeight: '800' }}>{nextItem.name}</Text>
              </Text>
            </>
          )}
        </View>

        {/* Controls */}
        <View style={{ paddingHorizontal: 20, paddingBottom: 10 }}>
          {phase === 'work' ? (
            <View style={{ flexDirection: 'row', gap: 9, marginBottom: 16 }}>
              <AdjustButton
                theme={theme}
                active={difficulty === 'easier'}
                icon="remove-circle-outline"
                label="Make it easier"
                onPress={() => {
                  tap();
                  setDifficulty(difficulty === 'easier' ? 'normal' : 'easier');
                  voice.speak(item.easier);
                }}
              />
              <AdjustButton
                theme={theme}
                active={difficulty === 'harder'}
                icon="add-circle-outline"
                label="Push harder"
                onPress={() => {
                  tap();
                  setDifficulty(difficulty === 'harder' ? 'normal' : 'harder');
                  voice.speak(item.harder);
                }}
              />
            </View>
          ) : null}

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
            <RoundButton theme={theme} icon="volume-high-outline" onPress={() => voice.speak(phase === 'work' ? `${item.name}. ${item.cue}` : 'Resting. Breathe slowly.', { force: true })} />
            <Pressable
              onPress={() => {
                tap('medium');
                setPaused((p) => !p);
              }}
            >
              <LinearGradient
                colors={grad}
                style={{ width: 74, height: 74, borderRadius: 37, alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name={paused ? 'play' : 'pause'} size={30} color="#fff" />
              </LinearGradient>
            </Pressable>
            <RoundButton theme={theme} icon="play-skip-forward-outline" onPress={skipItem} />
          </View>

          <Pressable onPress={finish} style={{ alignSelf: 'center', marginTop: 18, padding: 8 }}>
            <Text style={{ color: theme.textFaint, fontSize: 13, fontWeight: '700' }}>
              Finish here — it still counts
            </Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </View>
  );
}

function Header({ theme, title, onClose }: any) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 14,
      }}
    >
      <Pressable onPress={onClose} hitSlop={12}>
        <Ionicons name="close" size={26} color={theme.text} />
      </Pressable>
      <Text style={{ color: theme.textDim, fontSize: 13.5, fontWeight: '800', letterSpacing: 0.4 }}>{title}</Text>
      <View style={{ width: 26 }} />
    </View>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text style={{ color: '#fff', fontSize: 19, fontWeight: '900' }}>{value}</Text>
      <Text style={{ color: 'rgba(255,255,255,0.78)', fontSize: 10.5, fontWeight: '700', marginTop: 1 }}>
        {label.toUpperCase()}
      </Text>
    </View>
  );
}

function ResultStat({ theme, value, label }: any) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ color: theme.text, fontSize: 25, fontWeight: '900', letterSpacing: -0.8 }}>{value}</Text>
      <Text style={{ color: theme.textFaint, fontSize: 11.5, fontWeight: '700', marginTop: 3 }}>{label}</Text>
    </View>
  );
}

function AdjustButton({ theme, icon, label, onPress, active }: any) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 7,
        paddingVertical: 12,
        borderRadius: radius.pill,
        borderWidth: 1.5,
        borderColor: active ? theme.primary : theme.border,
        backgroundColor: active ? theme.primarySoft : 'transparent',
      }}
    >
      <Ionicons name={icon} size={16} color={active ? theme.primary : theme.textDim} />
      <Text style={{ color: active ? theme.primary : theme.textDim, fontWeight: '700', fontSize: 12.5 }}>{label}</Text>
    </Pressable>
  );
}

function RoundButton({ theme, icon, onPress }: any) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 52,
        height: 52,
        borderRadius: 26,
        borderWidth: 1,
        borderColor: theme.border,
        backgroundColor: theme.card,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Ionicons name={icon} size={22} color={theme.textDim} />
    </Pressable>
  );
}
