import React, { useMemo, useState } from 'react';
import { Alert, Modal, Platform, Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useApp } from '../lib/AppContext';
import { radius } from '../lib/theme';
import { Card, FadeIn, GhostButton, GradientButton, Pill, SectionTitle } from '../components/ui';
import { SegmentedControl, Slider } from '../components/Slider';
import { BARRIERS, CHORES, EQUIPMENT, GOALS, LIMITATIONS, SLOTS } from '../lib/exercises';
import { bmi, bmiBand, dailyProteinTarget, nutritionTips } from '../lib/engine';
import { Sheet } from './TodayScreen';
import { voice } from '../lib/voice';
import { tap } from '../lib/haptics';

export default function ProfileScreen({ navigation }: any) {
  const { theme, profile, settings, updateSettings, resetAll, saveProfile, logs } = useApp();
  const [editOpen, setEditOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [editWeight, setEditWeight] = useState(profile?.weightKg ?? 65);
  const [editMotivation, setEditMotivation] = useState(profile?.motivation ?? 5);

  if (!profile) return null;

  const tips = useMemo(() => nutritionTips(profile), [profile]);
  const b = bmi(profile);
  const band = bmiBand(b);
  const label = (arr: any[], keys: string[]) =>
    keys.map((k) => arr.find((x) => x.key === k)?.label).filter(Boolean).join(' · ') || 'None';

  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <LinearGradient colors={theme.gradHero} style={{ position: 'absolute', left: 0, right: 0, top: 0, height: 280 }} />
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <FadeIn>
            <View style={{ alignItems: 'center', paddingVertical: 14 }}>
              <LinearGradient
                colors={theme.gradWarm}
                style={{ width: 78, height: 78, borderRadius: 39, alignItems: 'center', justifyContent: 'center' }}
              >
                <Text style={{ color: '#fff', fontSize: 30, fontWeight: '900' }}>
                  {profile.name.charAt(0).toUpperCase()}
                </Text>
              </LinearGradient>
              <Text style={{ color: theme.text, fontSize: 23, fontWeight: '900', letterSpacing: -0.6, marginTop: 14 }}>
                {profile.name}
              </Text>
              <Text style={{ color: theme.textDim, fontSize: 13, marginTop: 4 }}>
                {profile.age} yrs · {profile.heightCm} cm · {profile.weightKg} kg
              </Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <Pill theme={theme} label={`BMI ${b} · ${band.label}`} color={band.color} />
              </View>
            </View>
          </FadeIn>

          {/* Plan summary */}
          <FadeIn delay={70}>
            <Card theme={theme} style={{ marginTop: 10 }}>
              <SectionTitle theme={theme} title="Your plan inputs" action="Quick edit" onAction={() => {
                tap();
                setEditWeight(profile.weightKg);
                setEditMotivation(profile.motivation);
                setEditOpen(true);
              }} />
              <Row theme={theme} icon="flag-outline" label="Goals" value={label(GOALS, profile.goals)} />
              <Row theme={theme} icon="resize-outline" label="Space" value={
                profile.space === 'yoga_mat' ? 'Mat-sized patch' : profile.space === 'small_room' ? 'Small room corner' : profile.space === 'full_room' ? 'A full room' : 'Terrace / courtyard'
              } />
              <Row theme={theme} icon="barbell-outline" label="Equipment" value={label(EQUIPMENT, profile.equipment)} />
              <Row theme={theme} icon="briefcase-outline" label="Work / study" value={`${profile.workHours} hrs a day`} />
              <Row theme={theme} icon="home-outline" label="Household work" value={`${label(CHORES, profile.chores)} · ${profile.choreMinutes} min`} />
              <Row theme={theme} icon="moon-outline" label="Sleep" value={`${profile.sleepTime} to ${profile.wakeTime}`} />
              <Row theme={theme} icon="time-outline" label="Preferred slots" value={label(SLOTS, profile.preferredSlots)} />
              <Row theme={theme} icon="medkit-outline" label="Limitations" value={label(LIMITATIONS, profile.limitations)} />
              <Row theme={theme} icon="alert-circle-outline" label="Barriers" value={label(BARRIERS, profile.barriers)} last />
            </Card>
          </FadeIn>

          {/* Barrier plan */}
          <FadeIn delay={110}>
            <Card theme={theme} style={{ marginTop: 14 }}>
              <SectionTitle theme={theme} title="How I work around your barriers" />
              {profile.barriers.map((k) => {
                const bar = BARRIERS.find((x) => x.key === k);
                if (!bar) return null;
                return (
                  <View key={k} style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 12,
                        backgroundColor: theme.primarySoft,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Ionicons name={bar.icon as any} size={16} color={theme.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: theme.text, fontWeight: '800', fontSize: 13.5 }}>{bar.label}</Text>
                      <Text style={{ color: theme.textDim, fontSize: 12.5, lineHeight: 19, marginTop: 4 }}>
                        {bar.reframe}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </Card>
          </FadeIn>

          {/* Nutrition */}
          <FadeIn delay={150}>
            <Card theme={theme} style={{ marginTop: 14 }}>
              <SectionTitle theme={theme} title="Food guidance for your thali" />
              <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
                <Pill theme={theme} label={`${dailyProteinTarget(profile)}g protein/day`} icon="nutrition-outline" />
                <Pill theme={theme} label={profile.diet.toUpperCase()} color={theme.violet} />
              </View>
              {tips.map((t, i) => (
                <View
                  key={i}
                  style={{
                    flexDirection: 'row',
                    gap: 12,
                    paddingVertical: 12,
                    borderTopWidth: i === 0 ? 0 : 1,
                    borderTopColor: theme.border,
                  }}
                >
                  <Ionicons name={t.icon as any} size={18} color={theme.accent} style={{ marginTop: 2 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.text, fontWeight: '800', fontSize: 13.5 }}>{t.title}</Text>
                    <Text style={{ color: theme.textDim, fontSize: 12.5, lineHeight: 19, marginTop: 4 }}>{t.body}</Text>
                  </View>
                </View>
              ))}
            </Card>
          </FadeIn>

          {/* Settings */}
          <FadeIn delay={190}>
            <Card theme={theme} style={{ marginTop: 14 }}>
              <SectionTitle theme={theme} title="Coach settings" />

              <ToggleRow
                theme={theme}
                icon="volume-high-outline"
                label="Voice coaching"
                sub="Aarti speaks cues and encouragement"
                value={settings.voice}
                onChange={(v) => {
                  updateSettings({ voice: v });
                  if (v) voice.speak('Voice coaching is on. I will guide you through every move.', { force: true });
                  else voice.stop();
                }}
              />
              <ToggleRow
                theme={theme}
                icon="phone-portrait-outline"
                label="Haptic feedback"
                sub="Subtle buzz on taps and timers"
                value={settings.haptics}
                onChange={(v) => updateSettings({ haptics: v })}
              />
              <ToggleRow
                theme={theme}
                icon="notifications-outline"
                label="Gentle nudges"
                sub="Reminders that never scold you"
                value={settings.reminders}
                onChange={(v) => updateSettings({ reminders: v })}
                last
              />

              <Text style={{ color: theme.textFaint, fontSize: 12, fontWeight: '800', letterSpacing: 0.8, marginTop: 18, marginBottom: 10 }}>
                VOICE SPEED
              </Text>
              <Slider
                theme={theme}
                value={settings.voiceRate}
                min={0.6}
                max={1.3}
                step={0.05}
                onChange={(v) => updateSettings({ voiceRate: v })}
                tint="mint"
                format={(v) => `${v.toFixed(2)}x`}
              />
              <GhostButton
                theme={theme}
                label="Test the voice"
                icon="play-outline"
                style={{ marginTop: 14 }}
                onPress={() =>
                  voice.speak(
                    `Hi ${profile.name.split(' ')[0]}, this is how I will sound during your workouts. Nice and steady.`,
                    { force: true }
                  )
                }
              />

              <Text style={{ color: theme.textFaint, fontSize: 12, fontWeight: '800', letterSpacing: 0.8, marginTop: 22, marginBottom: 10 }}>
                APPEARANCE
              </Text>
              <SegmentedControl
                theme={theme}
                value={settings.theme}
                onChange={(k) => updateSettings({ theme: k as any })}
                options={[
                  { key: 'dark', label: 'Dark' },
                  { key: 'light', label: 'Light' },
                  { key: 'system', label: 'System' },
                ]}
              />
            </Card>
          </FadeIn>

          {/* Danger */}
          <FadeIn delay={230}>
            <View style={{ marginTop: 18, gap: 10 }}>
              <GhostButton
                theme={theme}
                label="Redo the full coach interview"
                icon="refresh-outline"
                onPress={() => {
                  tap();
                  setConfirmReset(true);
                }}
              />
              <Text style={{ color: theme.textFaint, fontSize: 11.5, textAlign: 'center', lineHeight: 17, marginTop: 6 }}>
                {logs.length} sessions logged · all data stays on this device{'\n'}
                GharFit is a coaching aid, not medical advice.
              </Text>
            </View>
          </FadeIn>
        </ScrollView>
      </SafeAreaView>

      {/* quick edit */}
      <Modal visible={editOpen} transparent animationType="slide" onRequestClose={() => setEditOpen(false)}>
        <Sheet theme={theme} onClose={() => setEditOpen(false)} title="Quick edit">
          <Text style={{ color: theme.textFaint, fontSize: 12, fontWeight: '800', letterSpacing: 0.8, marginBottom: 10 }}>
            WEIGHT
          </Text>
          <Slider theme={theme} value={editWeight} min={35} max={160} step={0.5} onChange={setEditWeight} tint="violet" format={(v) => `${v} kg`} />
          <Text style={{ color: theme.textFaint, fontSize: 12, fontWeight: '800', letterSpacing: 0.8, marginTop: 20, marginBottom: 10 }}>
            MOTIVATION TODAY
          </Text>
          <Slider theme={theme} value={editMotivation} min={1} max={10} onChange={setEditMotivation} format={(v) => `${v} / 10`} />
          <GradientButton
            theme={theme}
            label="Save changes"
            icon="checkmark"
            style={{ marginTop: 22 }}
            onPress={async () => {
              tap('success');
              await saveProfile({ ...profile, weightKg: editWeight, motivation: editMotivation });
              setEditOpen(false);
            }}
          />
        </Sheet>
      </Modal>

      {/* reset confirm */}
      <Modal visible={confirmReset} transparent animationType="fade" onRequestClose={() => setConfirmReset(false)}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center', padding: 28 }}>
          <View style={{ backgroundColor: theme.bgElevated, borderRadius: 24, padding: 24, width: '100%' }}>
            <Ionicons name="warning-outline" size={26} color={theme.danger} />
            <Text style={{ color: theme.text, fontSize: 19, fontWeight: '900', marginTop: 12, letterSpacing: -0.4 }}>
              Start over completely?
            </Text>
            <Text style={{ color: theme.textDim, fontSize: 13.5, lineHeight: 20, marginTop: 8 }}>
              This clears your profile, plans and all logged sessions. It cannot be undone.
            </Text>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 22 }}>
              <GhostButton theme={theme} label="Cancel" onPress={() => setConfirmReset(false)} style={{ flex: 1 }} />
              <Pressable
                onPress={async () => {
                  tap('heavy');
                  setConfirmReset(false);
                  await resetAll();
                }}
                style={{
                  flex: 1,
                  paddingVertical: 13,
                  borderRadius: radius.pill,
                  backgroundColor: theme.danger,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }}>Reset all</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Row({ theme, icon, label, value, last }: any) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        paddingVertical: 11,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.border,
      }}
    >
      <Ionicons name={icon} size={17} color={theme.textFaint} style={{ marginTop: 1 }} />
      <Text style={{ color: theme.textDim, fontSize: 13, fontWeight: '700', width: 108 }}>{label}</Text>
      <Text style={{ color: theme.text, fontSize: 13, flex: 1, lineHeight: 19, fontWeight: '600' }}>{value}</Text>
    </View>
  );
}

function ToggleRow({
  theme,
  icon,
  label,
  sub,
  value,
  onChange,
  last,
}: {
  theme: any;
  icon: any;
  label: string;
  sub: string;
  value: boolean;
  onChange: (v: boolean) => void;
  last?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 13,
        borderBottomWidth: last ? 0 : 1,
        borderBottomColor: theme.border,
      }}
    >
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 12,
          backgroundColor: theme.cardAlt,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Ionicons name={icon} size={17} color={theme.textDim} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: theme.text, fontSize: 14, fontWeight: '700' }}>{label}</Text>
        <Text style={{ color: theme.textFaint, fontSize: 11.5, marginTop: 2 }}>{sub}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={(v) => {
          tap();
          onChange(v);
        }}
        trackColor={{ false: theme.cardAlt, true: theme.primary }}
        thumbColor="#fff"
      />
    </View>
  );
}
