import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { darkTheme, lightTheme, Theme } from './theme';
import { store } from './storage';
import { DayPlan, LogEntry, Profile, RoutineBlock, Settings, WeightEntry } from './types';
import { generateDayPlan, todayKey, calories } from './engine';
import { computeStreak } from './coach';
import { voice } from './voice';
import { setHaptics } from './haptics';

interface Ctx {
  ready: boolean;
  profile: Profile | null;
  logs: LogEntry[];
  weights: WeightEntry[];
  plan: DayPlan | null;
  settings: Settings;
  theme: Theme;
  streak: number;
  todayMinutes: number;
  saveProfile: (p: Profile) => Promise<void>;
  updateSettings: (s: Partial<Settings>) => void;
  checkIn: (energy: number, timeBudget: number) => void;
  regenerate: () => void;
  addBlock: (b: RoutineBlock) => void;
  completeBlock: (blockId: string) => void;
  logCustom: (title: string, kind: LogEntry['kind'], minutes: number, met?: number) => void;
  addWeight: (kg: number) => void;
  resetAll: () => Promise<void>;
}

const AppCtx = createContext<Ctx>(null as unknown as Ctx);
export const useApp = () => useContext(AppCtx);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const scheme = useColorScheme();
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [weights, setWeights] = useState<WeightEntry[]>([]);
  const [plans, setPlans] = useState<Record<string, DayPlan>>({});
  const [settings, setSettings] = useState<Settings>({
    voice: true,
    voiceRate: 0.95,
    haptics: true,
    theme: 'dark',
    reminders: true,
  });
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    (async () => {
      const [p, l, pl, s, w] = await Promise.all([
        store.getProfile(),
        store.getLogs(),
        store.getPlans(),
        store.getSettings(),
        store.getWeights(),
      ]);
      setProfile(p);
      setLogs(l);
      setPlans(pl);
      setSettings(s);
      setWeights(w);
      setReady(true);
    })();
  }, []);

  useEffect(() => {
    voice.configure(settings.voice, settings.voiceRate);
    setHaptics(settings.haptics);
  }, [settings.voice, settings.voiceRate, settings.haptics]);

  const theme = useMemo<Theme>(() => {
    const mode = settings.theme === 'system' ? (scheme === 'light' ? 'light' : 'dark') : settings.theme;
    return mode === 'light' ? lightTheme : darkTheme;
  }, [settings.theme, scheme]);

  const plan = plans[todayKey()] || null;

  const saveProfile = useCallback(async (p: Profile) => {
    setProfile(p);
    await store.setProfile(p);
  }, []);

  const updateSettings = useCallback(
    (s: Partial<Settings>) => {
      setSettings((prev) => {
        const next = { ...prev, ...s };
        store.setSettings(next);
        return next;
      });
    },
    []
  );

  const persistPlans = (next: Record<string, DayPlan>) => {
    setPlans(next);
    store.setPlans(next);
  };

  const checkIn = useCallback(
    (energy: number, timeBudget: number) => {
      if (!profile) return;
      const p = generateDayPlan(profile, energy, timeBudget, seed);
      const existing = plans[todayKey()];
      if (existing) p.completed = existing.completed;
      persistPlans({ ...plans, [todayKey()]: p });
    },
    [profile, plans, seed]
  );

  const regenerate = useCallback(() => {
    if (!profile) return;
    const cur = plans[todayKey()];
    const nextSeed = seed + 1;
    setSeed(nextSeed);
    const p = generateDayPlan(profile, cur?.energy ?? 3, cur?.timeBudget ?? 20, nextSeed);
    if (cur) p.completed = cur.completed;
    persistPlans({ ...plans, [todayKey()]: p });
  }, [profile, plans, seed]);

  const addBlock = useCallback(
    (b: RoutineBlock) => {
      const cur = plans[todayKey()];
      if (!cur) return;
      if (cur.blocks.some((x) => x.id === b.id)) return;
      persistPlans({ ...plans, [todayKey()]: { ...cur, blocks: [b, ...cur.blocks] } });
    },
    [plans]
  );

  const pushLog = (entry: LogEntry) => {
    setLogs((prev) => {
      const next = [entry, ...prev];
      store.setLogs(next);
      return next;
    });
  };

  const completeBlock = useCallback(
    (blockId: string) => {
      const cur = plans[todayKey()];
      if (!cur || !profile) return;
      const block = cur.blocks.find((b) => b.id === blockId);
      if (!block || cur.completed.includes(blockId)) return;
      const met = block.kind === 'chore' ? 3.2 : block.kind === 'workout' ? 5.2 : 2.6;
      pushLog({
        id: `${blockId}-${Date.now()}`,
        date: todayKey(),
        title: block.title,
        kind: block.kind,
        minutes: block.minutes,
        calories: calories(met, profile.weightKg, block.minutes),
        ts: Date.now(),
      });
      persistPlans({ ...plans, [todayKey()]: { ...cur, completed: [...cur.completed, blockId] } });
    },
    [plans, profile]
  );

  const logCustom = useCallback(
    (title: string, kind: LogEntry['kind'], minutes: number, met = 3.2) => {
      if (!profile) return;
      pushLog({
        id: `custom-${Date.now()}`,
        date: todayKey(),
        title,
        kind,
        minutes,
        calories: calories(met, profile.weightKg, minutes),
        ts: Date.now(),
      });
    },
    [profile]
  );

  const addWeight = useCallback(
    (kg: number) => {
      setWeights((prev) => {
        const next = [...prev.filter((w) => w.date !== todayKey()), { date: todayKey(), kg }].sort((a, b) =>
          a.date.localeCompare(b.date)
        );
        store.setWeights(next);
        return next;
      });
      if (profile) saveProfile({ ...profile, weightKg: kg });
    },
    [profile, saveProfile]
  );

  const resetAll = useCallback(async () => {
    await store.reset();
    setProfile(null);
    setLogs([]);
    setPlans({});
    setWeights([]);
  }, []);

  const streak = useMemo(() => computeStreak(logs), [logs]);
  const todayMinutes = useMemo(
    () => logs.filter((l) => l.date === todayKey()).reduce((a, l) => a + l.minutes, 0),
    [logs]
  );

  const value: Ctx = {
    ready,
    profile,
    logs,
    weights,
    plan,
    settings,
    theme,
    streak,
    todayMinutes,
    saveProfile,
    updateSettings,
    checkIn,
    regenerate,
    addBlock,
    completeBlock,
    logCustom,
    addWeight,
    resetAll,
  };

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}
