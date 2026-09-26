import AsyncStorage from '@react-native-async-storage/async-storage';
import { DayPlan, LogEntry, Profile, Settings, WeightEntry } from './types';

const K = {
  profile: '@gharfit/profile/v1',
  logs: '@gharfit/logs/v1',
  plans: '@gharfit/plans/v1',
  settings: '@gharfit/settings/v1',
  weights: '@gharfit/weights/v1',
  badges: '@gharfit/badges/v1',
};

async function get<T>(key: string, fallback: T): Promise<T> {
  try {
    const v = await AsyncStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
async function set(key: string, value: unknown) {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export const store = {
  getProfile: () => get<Profile | null>(K.profile, null),
  setProfile: (p: Profile) => set(K.profile, p),
  getLogs: () => get<LogEntry[]>(K.logs, []),
  setLogs: (l: LogEntry[]) => set(K.logs, l),
  getPlans: () => get<Record<string, DayPlan>>(K.plans, {}),
  setPlans: (p: Record<string, DayPlan>) => set(K.plans, p),
  getWeights: () => get<WeightEntry[]>(K.weights, []),
  setWeights: (w: WeightEntry[]) => set(K.weights, w),
  getSettings: () =>
    get<Settings>(K.settings, { voice: true, voiceRate: 0.95, haptics: true, theme: 'dark', reminders: true }),
  setSettings: (s: Settings) => set(K.settings, s),
  reset: async () => {
    try {
      await Promise.all(Object.values(K).map((k) => AsyncStorage.removeItem(k)));
    } catch {
      /* ignore */
    }
  },
};
