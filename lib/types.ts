export type GoalKey =
  | 'lose_weight'
  | 'get_stronger'
  | 'more_energy'
  | 'flexibility'
  | 'stress_relief'
  | 'stay_active'
  | 'posture';

export type LevelKey = 'never' | 'restart' | 'light' | 'regular';
export type SpaceKey = 'yoga_mat' | 'small_room' | 'full_room' | 'terrace';

export interface Profile {
  name: string;
  age: number;
  heightCm: number;
  weightKg: number;
  gender: 'female' | 'male' | 'other';
  goals: GoalKey[];
  level: LevelKey;
  space: SpaceKey;
  equipment: string[];
  workHours: number;
  workType: 'job' | 'study' | 'home' | 'both';
  chores: string[];
  choreMinutes: number;
  sleepTime: string;
  wakeTime: string;
  preferredSlots: string[];
  diet: string;
  foodPrefs: string[];
  limitations: string[];
  barriers: string[];
  motivation: number;
  createdAt: number;
}

export interface LogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  kind: 'workout' | 'chore' | 'micro' | 'mobility';
  minutes: number;
  calories: number;
  ts: number;
}

export interface WeightEntry {
  date: string;
  kg: number;
}

export interface RoutineItem {
  id: string;
  exerciseId: string;
  name: string;
  hindi?: string;
  seconds: number;
  reps?: string;
  cue: string;
  easier: string;
  harder: string;
}

export interface RoutineBlock {
  id: string;
  title: string;
  subtitle: string;
  slot: string;
  timeLabel: string;
  kind: 'workout' | 'chore' | 'micro' | 'mobility';
  minutes: number;
  icon: string;
  tint: 'warm' | 'mint' | 'violet';
  items: RoutineItem[];
  note?: string;
}

export interface DayPlan {
  date: string;
  energy: number; // 1-5
  timeBudget: number; // minutes
  blocks: RoutineBlock[];
  completed: string[];
  checkedIn: boolean;
  headline: string;
  subline: string;
}

export interface Settings {
  voice: boolean;
  voiceRate: number;
  haptics: boolean;
  theme: 'system' | 'dark' | 'light';
  reminders: boolean;
}
