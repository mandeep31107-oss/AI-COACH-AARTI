import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../lib/AppContext';
import { radius } from '../lib/theme';
import { Chip, FadeIn, GhostButton, GradientButton } from '../components/ui';
import { SegmentedControl, Slider } from '../components/Slider';
import {
  BARRIERS,
  CHORES,
  DIETS,
  EQUIPMENT,
  FOOD_PREFS,
  GOALS,
  LIMITATIONS,
  SLOTS,
} from '../lib/exercises';
import { Profile } from '../lib/types';
import { voice } from '../lib/voice';
import { tap } from '../lib/haptics';

const TIMES = ['5:00 AM', '5:30 AM', '6:00 AM', '6:30 AM', '7:00 AM', '7:30 AM', '8:00 AM', '9:00 AM'];
const SLEEPS = ['9:30 PM', '10:00 PM', '10:30 PM', '11:00 PM', '11:30 PM', '12:00 AM', '1:00 AM'];

const LEVELS = [
  { key: 'never', label: 'Never exercised', sub: 'Total beginner, and that is fine', icon: 'leaf-outline' },
  { key: 'restart', label: 'Used to, then stopped', sub: 'Restarting after a long gap', icon: 'refresh-outline' },
  { key: 'light', label: 'Light & occasional', sub: 'A walk or yoga sometimes', icon: 'walk-outline' },
  { key: 'regular', label: 'Fairly regular', sub: '3+ times a week already', icon: 'barbell-outline' },
];

const SPACES = [
  { key: 'yoga_mat', label: 'Just a mat-sized patch', sub: 'About 6 x 3 feet', icon: 'square-outline' },
  { key: 'small_room', label: 'Small room corner', sub: 'I can take two steps', icon: 'cube-outline' },
  { key: 'full_room', label: 'A full room', sub: 'Can move around freely', icon: 'expand-outline' },
  { key: 'terrace', label: 'Terrace or courtyard', sub: 'Open outdoor space', icon: 'sunny-outline' },
];

export default function OnboardingScreen() {
  const { theme, saveProfile, settings, updateSettings, checkIn } = useApp();
  const [step, setStep] = useState(0);
  const [building, setBuilding] = useState(false);

  const [name, setName] = useState('');
  const [gender, setGender] = useState<'female' | 'male' | 'other'>('female');
  const [age, setAge] = useState(30);
  const [height, setHeight] = useState(163);
  const [weight, setWeight] = useState(68);
  const [goals, setGoals] = useState<string[]>([]);
  const [level, setLevel] = useState('restart');
  const [space, setSpace] = useState('small_room');
  const [equipment, setEquipment] = useState<string[]>(['none']);
  const [workHours, setWorkHours] = useState(8);
  const [workType, setWorkType] = useState<'job' | 'study' | 'home' | 'both'>('job');
  const [chores, setChores] = useState<string[]>([]);
  const [choreMinutes, setChoreMinutes] = useState(45);
  const [wakeTime, setWakeTime] = useState('6:30 AM');
  const [sleepTime, setSleepTime] = useState('11:00 PM');
  const [slots, setSlots] = useState<string[]>([]);
  const [diet, setDiet] = useState('veg');
  const [foodPrefs, setFoodPrefs] = useState<string[]>([]);
  const [limitations, setLimitations] = useState<string[]>([]);
  const [barriers, setBarriers] = useState<string[]>([]);
  const [motivation, setMotivation] = useState(5);

  const toggle = (arr: string[], setter: (v: string[]) => void, key: string, exclusive?: string) => {
    tap();
    if (exclusive && key === exclusive) {
      setter(arr.includes(key) ? [] : [key]);
      return;
    }
    const cleaned = exclusive ? arr.filter((k) => k !== exclusive) : arr;
    setter(cleaned.includes(key) ? cleaned.filter((k) => k !== key) : [...cleaned, key]);
  };

  const first = name.trim().split(' ')[0] || 'friend';

  const steps = useMemo(
    () => [
      {
        q: 'Namaste. I am Aarti, your home fitness coach.',
        sub: 'No gym, no judgement, no six-pack promises. Let me learn about your actual life first. What should I call you?',
        valid: name.trim().length > 0,
        speak: 'Namaste. I am Aarti, your home fitness coach. No gym, no judgement. What should I call you?',
      },
      {
        q: `Hello ${first}. A few basics first.`,
        sub: 'Age helps me set the right intensity and recovery time for you.',
        valid: true,
        speak: `Hello ${first}. Tell me your age, so I can set the right intensity for you.`,
      },
      {
        q: 'Your height and weight?',
        sub: 'Only used to calculate your calorie burn accurately. This number is never shown to anyone else.',
        valid: true,
        speak: 'What is your height and weight? I only use this to calculate your calorie burn accurately.',
      },
      {
        q: 'What are you actually hoping for?',
        sub: 'Pick everything that feels true. Honesty works better than ambition here.',
        valid: goals.length > 0,
        speak: 'What are you hoping for? Pick everything that feels true.',
      },
      {
        q: 'Where are you starting from?',
        sub: 'There is no wrong answer. Beginners get the best plans because we build from zero properly.',
        valid: true,
        speak: 'Where are you starting from today? There is no wrong answer.',
      },
      {
        q: 'How much space do you really have?',
        sub: 'Be realistic, not optimistic. I will build the plan around whatever this is.',
        valid: true,
        speak: 'How much space do you really have at home? Be realistic, not optimistic.',
      },
      {
        q: 'What do you have at home?',
        sub: 'Water bottles and an atta bag count. Most people already own a gym without knowing it.',
        valid: equipment.length > 0,
        speak: 'What do you have at home? Water bottles and an atta bag count as equipment here.',
      },
      {
        q: 'How does your work day look?',
        sub: 'This decides where in your day the movement can realistically fit.',
        valid: true,
        speak: 'How many hours do you work or study each day?',
      },
      {
        q: 'What household work falls on you?',
        sub: 'This is important. Your chores are real physical work and I will count them as exercise.',
        valid: true,
        speak: 'What household work falls on you? Your chores are real exercise and I will count them.',
      },
      {
        q: 'When do you sleep and wake?',
        sub: 'Sleep decides your energy. I will build a wind-down block around your bedtime.',
        valid: true,
        speak: 'When do you wake up and when do you sleep?',
      },
      {
        q: 'When could movement actually happen?',
        sub: 'Pick the windows that are genuinely free. Even 10 minutes counts.',
        valid: slots.length > 0,
        speak: 'When could movement actually happen in your day? Pick the windows that are genuinely free.',
      },
      {
        q: 'Tell me about your food.',
        sub: 'I will not hand you a boiled-chicken diet. We work with roti, dal, chawal and chai.',
        valid: true,
        speak: 'Tell me about your food. We will work with roti, dal, chawal and chai, not boiled chicken.',
      },
      {
        q: 'Anything that hurts or limits you?',
        sub: 'I will remove every move that loads a painful joint. Nothing gets forced here.',
        valid: limitations.length > 0,
        speak: 'Anything that hurts or limits you? I will remove every move that loads a painful joint.',
      },
      {
        q: 'Now the honest one. What stops you?',
        sub: 'This is the most useful question in the whole app. Pick everything that is true.',
        valid: barriers.length > 0,
        speak: 'Now the honest question. What actually stops you from exercising? Pick everything that is true.',
      },
      {
        q: 'How motivated do you feel today?',
        sub: 'Low is completely fine. I design for your worst day, not your best one.',
        valid: true,
        speak: 'How motivated do you feel today? Low is completely fine.',
      },
    ],
    [name, first, goals, equipment, slots, limitations, barriers]
  );

  const current = steps[step];
  const progress = (step + 1) / steps.length;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: progress,
      duration: 380,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnim]);

  useEffect(() => {
    if (settings.voice && current) voice.speak(current.speak);
    return () => voice.stop();
  }, [step]);

  const build = async () => {
    setBuilding(true);
    voice.speak(
      `Give me a moment ${first}. I am building a plan around your space, your chores and your energy.`
    );
    const profile: Profile = {
      name: name.trim(),
      age,
      heightCm: height,
      weightKg: weight,
      gender,
      goals: goals as Profile['goals'],
      level: level as Profile['level'],
      space: space as Profile['space'],
      equipment,
      workHours,
      workType,
      chores,
      choreMinutes,
      sleepTime,
      wakeTime,
      preferredSlots: slots,
      diet,
      foodPrefs,
      limitations,
      barriers,
      motivation,
      createdAt: Date.now(),
    };
    await new Promise((r) => setTimeout(r, 1700));
    await saveProfile(profile);
    setTimeout(() => checkIn(Math.max(2, Math.round(motivation / 2)), 20), 120);
  };

  const next = () => {
    tap('medium');
    if (step === steps.length - 1) build();
    else setStep((s) => s + 1);
  };

  if (building) return <BuildingScreen name={first} />;

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <LinearGradient
        colors={theme.gradHero}
        style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 380 }}
      />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {/* progress */}
          <View style={{ paddingHorizontal: 22, paddingTop: 10, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Pressable
              onPress={() => {
                tap();
                setStep((s) => Math.max(0, s - 1));
              }}
              disabled={step === 0}
              style={{ opacity: step === 0 ? 0.25 : 1 }}
              hitSlop={12}
            >
              <Ionicons name="chevron-back" size={22} color={theme.text} />
            </Pressable>
            <View style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: theme.cardAlt, overflow: 'hidden' }}>
              <Animated.View
                style={{
                  height: '100%',
                  borderRadius: 3,
                  backgroundColor: theme.primary,
                  width: progressAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
                }}
              />
            </View>
            <Text style={{ color: theme.textFaint, fontSize: 12, fontWeight: '700' }}>
              {step + 1}/{steps.length}
            </Text>
            <Pressable
              onPress={() => {
                tap();
                updateSettings({ voice: !settings.voice });
                if (settings.voice) voice.stop();
              }}
              hitSlop={12}
            >
              <Ionicons
                name={settings.voice ? 'volume-high' : 'volume-mute'}
                size={20}
                color={settings.voice ? theme.primary : theme.textFaint}
              />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={{ padding: 22, paddingBottom: 30 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <FadeIn key={`h-${step}`} delay={40}>
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 18, marginBottom: 22 }}>
                <LinearGradient
                  colors={theme.gradWarm}
                  style={{ width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Ionicons name="sparkles" size={20} color="#fff" />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: theme.primary, fontSize: 11.5, fontWeight: '900', letterSpacing: 1.1 }}>
                    COACH AARTI
                  </Text>
                  <Text
                    style={{
                      color: theme.text,
                      fontSize: 25,
                      fontWeight: '900',
                      letterSpacing: -0.7,
                      marginTop: 6,
                      lineHeight: 31,
                    }}
                  >
                    {current.q}
                  </Text>
                  <Text style={{ color: theme.textDim, fontSize: 14.5, lineHeight: 21, marginTop: 10 }}>
                    {current.sub}
                  </Text>
                </View>
              </View>
            </FadeIn>

            <FadeIn key={`b-${step}`} delay={120}>
              <StepBody
                step={step}
                theme={theme}
                state={{
                  name,
                  setName,
                  gender,
                  setGender,
                  age,
                  setAge,
                  height,
                  setHeight,
                  weight,
                  setWeight,
                  goals,
                  setGoals,
                  level,
                  setLevel,
                  space,
                  setSpace,
                  equipment,
                  setEquipment,
                  workHours,
                  setWorkHours,
                  workType,
                  setWorkType,
                  chores,
                  setChores,
                  choreMinutes,
                  setChoreMinutes,
                  wakeTime,
                  setWakeTime,
                  sleepTime,
                  setSleepTime,
                  slots,
                  setSlots,
                  diet,
                  setDiet,
                  foodPrefs,
                  setFoodPrefs,
                  limitations,
                  setLimitations,
                  barriers,
                  setBarriers,
                  motivation,
                  setMotivation,
                  toggle,
                }}
              />
            </FadeIn>
          </ScrollView>

          <View style={{ padding: 22, paddingTop: 6, gap: 10 }}>
            <GradientButton
              theme={theme}
              label={step === steps.length - 1 ? 'Build my plan' : 'Continue'}
              icon={step === steps.length - 1 ? 'sparkles' : 'arrow-forward'}
              onPress={next}
              disabled={!current.valid}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

/* ------------------------------------------------------------------ */

function StepBody({ step, theme, state }: { step: number; theme: any; state: any }) {
  const s = state;
  const wrap = { flexDirection: 'row' as const, flexWrap: 'wrap' as const };

  switch (step) {
    case 0:
      return (
        <View>
          <TextInput
            value={s.name}
            onChangeText={s.setName}
            placeholder="Your name"
            placeholderTextColor={theme.textFaint}
            returnKeyType="done"
            autoCapitalize="words"
            style={{
              backgroundColor: theme.card,
              borderWidth: 1.5,
              borderColor: s.name ? theme.primary : theme.border,
              borderRadius: radius.md,
              paddingHorizontal: 18,
              paddingVertical: 16,
              color: theme.text,
              fontSize: 17,
              fontWeight: '700',
            }}
          />
          <View
            style={{
              marginTop: 18,
              padding: 16,
              borderRadius: radius.md,
              backgroundColor: theme.accentSoft,
              flexDirection: 'row',
              gap: 10,
            }}
          >
            <Ionicons name="lock-closed-outline" size={18} color={theme.accent} />
            <Text style={{ color: theme.textDim, fontSize: 13, lineHeight: 19, flex: 1 }}>
              Everything you tell me stays on this device. No sharing, no leaderboards, no before-after photos.
            </Text>
          </View>
        </View>
      );

    case 1:
      return (
        <View style={{ gap: 24 }}>
          <View>
            <Label theme={theme} text="I am" />
            <SegmentedControl
              theme={theme}
              value={s.gender}
              onChange={s.setGender}
              options={[
                { key: 'female', label: 'Female' },
                { key: 'male', label: 'Male' },
                { key: 'other', label: 'Other' },
              ]}
            />
          </View>
          <View>
            <Label theme={theme} text="Age" />
            <Slider theme={theme} value={s.age} min={14} max={80} onChange={s.setAge} format={(v) => `${v} years`} />
          </View>
        </View>
      );

    case 2:
      return (
        <View style={{ gap: 26 }}>
          <View>
            <Label theme={theme} text="Height" />
            <Slider
              theme={theme}
              value={s.height}
              min={130}
              max={200}
              onChange={s.setHeight}
              tint="mint"
              format={(v) => `${v} cm  ·  ${Math.floor(v / 30.48)}'${Math.round((v / 2.54) % 12)}"`}
            />
          </View>
          <View>
            <Label theme={theme} text="Weight" />
            <Slider
              theme={theme}
              value={s.weight}
              min={35}
              max={160}
              onChange={s.setWeight}
              tint="violet"
              format={(v) => `${v} kg`}
            />
          </View>
        </View>
      );

    case 3:
      return (
        <View>
          {GOALS.map((g) => (
            <Chip
              key={g.key}
              theme={theme}
              wide
              label={g.label}
              icon={g.icon as any}
              selected={s.goals.includes(g.key)}
              onPress={() => s.toggle(s.goals, s.setGoals, g.key)}
            />
          ))}
        </View>
      );

    case 4:
      return (
        <View>
          {LEVELS.map((l) => (
            <Chip
              key={l.key}
              theme={theme}
              wide
              label={l.label}
              sub={l.sub}
              icon={l.icon as any}
              selected={s.level === l.key}
              onPress={() => {
                tap();
                s.setLevel(l.key);
              }}
            />
          ))}
        </View>
      );

    case 5:
      return (
        <View>
          {SPACES.map((sp) => (
            <Chip
              key={sp.key}
              theme={theme}
              wide
              label={sp.label}
              sub={sp.sub}
              icon={sp.icon as any}
              selected={s.space === sp.key}
              onPress={() => {
                tap();
                s.setSpace(sp.key);
              }}
            />
          ))}
        </View>
      );

    case 6:
      return (
        <View>
          {EQUIPMENT.map((e) => (
            <Chip
              key={e.key}
              theme={theme}
              wide
              label={e.label}
              sub={e.sub}
              icon={e.icon as any}
              selected={s.equipment.includes(e.key)}
              onPress={() => s.toggle(s.equipment, s.setEquipment, e.key, 'none')}
            />
          ))}
        </View>
      );

    case 7:
      return (
        <View style={{ gap: 24 }}>
          <View>
            <Label theme={theme} text="My day is mostly" />
            <SegmentedControl
              theme={theme}
              value={s.workType}
              onChange={s.setWorkType}
              options={[
                { key: 'job', label: 'Job' },
                { key: 'study', label: 'Study' },
                { key: 'home', label: 'Home' },
                { key: 'both', label: 'Both' },
              ]}
            />
          </View>
          <View>
            <Label theme={theme} text="Hours spent on work or study daily" />
            <Slider
              theme={theme}
              value={s.workHours}
              min={0}
              max={16}
              onChange={s.setWorkHours}
              tint="violet"
              format={(v) => `${v} hours`}
            />
          </View>
        </View>
      );

    case 8:
      return (
        <View style={{ gap: 22 }}>
          <View style={wrap}>
            {CHORES.map((c) => (
              <Chip
                key={c.key}
                theme={theme}
                label={c.label}
                selected={s.chores.includes(c.key)}
                onPress={() => s.toggle(s.chores, s.setChores, c.key, 'none')}
              />
            ))}
          </View>
          <View>
            <Label theme={theme} text="Roughly how long does household work take daily?" />
            <Slider
              theme={theme}
              value={s.choreMinutes}
              min={0}
              max={240}
              step={5}
              onChange={s.setChoreMinutes}
              tint="mint"
              format={(v) => (v >= 60 ? `${Math.floor(v / 60)}h ${v % 60}m` : `${v} min`)}
            />
          </View>
        </View>
      );

    case 9:
      return (
        <View style={{ gap: 22 }}>
          <View>
            <Label theme={theme} text="I wake up around" />
            <View style={wrap}>
              {TIMES.map((t) => (
                <Chip
                  key={t}
                  theme={theme}
                  label={t}
                  selected={s.wakeTime === t}
                  onPress={() => {
                    tap();
                    s.setWakeTime(t);
                  }}
                />
              ))}
            </View>
          </View>
          <View>
            <Label theme={theme} text="I sleep around" />
            <View style={wrap}>
              {SLEEPS.map((t) => (
                <Chip
                  key={t}
                  theme={theme}
                  label={t}
                  selected={s.sleepTime === t}
                  onPress={() => {
                    tap();
                    s.setSleepTime(t);
                  }}
                />
              ))}
            </View>
          </View>
        </View>
      );

    case 10:
      return (
        <View>
          {SLOTS.map((sl) => (
            <Chip
              key={sl.key}
              theme={theme}
              wide
              label={sl.label}
              sub={sl.time}
              icon={sl.icon as any}
              selected={s.slots.includes(sl.key)}
              onPress={() => s.toggle(s.slots, s.setSlots, sl.key)}
            />
          ))}
        </View>
      );

    case 11:
      return (
        <View style={{ gap: 20 }}>
          <View>
            <Label theme={theme} text="I eat" />
            <View style={wrap}>
              {DIETS.map((d) => (
                <Chip
                  key={d.key}
                  theme={theme}
                  label={d.label}
                  icon={d.icon as any}
                  selected={s.diet === d.key}
                  onPress={() => {
                    tap();
                    s.setDiet(d.key);
                  }}
                />
              ))}
            </View>
          </View>
          <View>
            <Label theme={theme} text="True for me" />
            <View style={wrap}>
              {FOOD_PREFS.map((f) => (
                <Chip
                  key={f.key}
                  theme={theme}
                  label={f.label}
                  selected={s.foodPrefs.includes(f.key)}
                  onPress={() => s.toggle(s.foodPrefs, s.setFoodPrefs, f.key)}
                />
              ))}
            </View>
          </View>
        </View>
      );

    case 12:
      return (
        <View>
          {LIMITATIONS.map((l) => (
            <Chip
              key={l.key}
              theme={theme}
              wide
              label={l.label}
              icon={l.icon as any}
              selected={s.limitations.includes(l.key)}
              onPress={() => s.toggle(s.limitations, s.setLimitations, l.key, 'none')}
            />
          ))}
        </View>
      );

    case 13:
      return (
        <View>
          {BARRIERS.map((b) => {
            const selected = s.barriers.includes(b.key);
            return (
              <View key={b.key}>
                <Chip
                  theme={theme}
                  wide
                  label={b.label}
                  icon={b.icon as any}
                  selected={selected}
                  onPress={() => s.toggle(s.barriers, s.setBarriers, b.key)}
                />
                {selected ? (
                  <FadeIn from={-6}>
                    <View
                      style={{
                        marginTop: -4,
                        marginBottom: 12,
                        marginLeft: 14,
                        paddingLeft: 14,
                        borderLeftWidth: 2,
                        borderLeftColor: theme.accent,
                      }}
                    >
                      <Text style={{ color: theme.accent, fontSize: 12.5, lineHeight: 19, fontWeight: '600' }}>
                        {b.reframe}
                      </Text>
                    </View>
                  </FadeIn>
                ) : null}
              </View>
            );
          })}
        </View>
      );

    case 14:
      return (
        <View style={{ gap: 18 }}>
          <Slider
            theme={theme}
            value={s.motivation}
            min={1}
            max={10}
            onChange={s.setMotivation}
            format={(v) => `${v} / 10`}
          />
          <View
            style={{
              padding: 16,
              borderRadius: radius.md,
              backgroundColor: s.motivation <= 4 ? theme.violetSoft : theme.accentSoft,
            }}
          >
            <Text style={{ color: theme.text, fontWeight: '800', fontSize: 14, marginBottom: 5 }}>
              {s.motivation <= 3
                ? 'Running on fumes — noted.'
                : s.motivation <= 6
                ? 'Somewhere in the middle. Very normal.'
                : 'Good energy to start with.'}
            </Text>
            <Text style={{ color: theme.textDim, fontSize: 13, lineHeight: 19 }}>
              {s.motivation <= 3
                ? 'Your first week will be two-minute blocks only. The goal is proving to yourself that you show up, nothing more.'
                : s.motivation <= 6
                ? 'We will keep sessions short and stackable so a bad day never breaks the chain.'
                : 'I will still keep day one easy. Starting too hard is the number one reason people quit in week two.'}
            </Text>
          </View>
        </View>
      );

    default:
      return null;
  }
}

function Label({ theme, text }: { theme: any; text: string }) {
  return (
    <Text style={{ color: theme.textFaint, fontSize: 12, fontWeight: '800', letterSpacing: 0.8, marginBottom: 12 }}>
      {text.toUpperCase()}
    </Text>
  );
}

function BuildingScreen({ name }: { name: string }) {
  const { theme } = useApp();
  const spin = useRef(new Animated.Value(0)).current;
  const [line, setLine] = useState(0);
  const lines = [
    'Reading your space and equipment...',
    'Removing moves that hurt your joints...',
    'Fitting blocks around your work hours...',
    'Turning your chores into logged movement...',
    'Writing your no-judgement plan...',
  ];

  useEffect(() => {
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true })
    ).start();
    const t = setInterval(() => setLine((l) => Math.min(lines.length - 1, l + 1)), 340);
    return () => clearInterval(t);
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg, alignItems: 'center', justifyContent: 'center', padding: 30 }}>
      <LinearGradient colors={theme.gradHero} style={{ position: 'absolute', inset: 0 as any, left: 0, right: 0, top: 0, bottom: 0 }} />
      <Animated.View
        style={{
          transform: [{ rotate: spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }],
        }}
      >
        <LinearGradient
          colors={theme.gradWarm}
          style={{ width: 84, height: 84, borderRadius: 42, alignItems: 'center', justifyContent: 'center' }}
        >
          <Ionicons name="barbell" size={36} color="#fff" />
        </LinearGradient>
      </Animated.View>
      <Text
        style={{ color: theme.text, fontSize: 23, fontWeight: '900', marginTop: 28, letterSpacing: -0.5, textAlign: 'center' }}
      >
        Building your plan, {name}
      </Text>
      <View style={{ marginTop: 20, height: 46, alignItems: 'center', justifyContent: 'center' }}>
        <FadeIn key={lines[line]} delay={0} from={8}>
          <Text style={{ color: theme.primary, fontSize: 13.5, textAlign: 'center' }}>{lines[line]}</Text>
        </FadeIn>
      </View>
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
        {lines.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === line ? 18 : 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: i <= line ? theme.primary : theme.cardAlt,
            }}
          />
        ))}
      </View>
    </View>
  );
}
