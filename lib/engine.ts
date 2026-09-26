import { EXERCISES, Exercise, CHORE_WORKOUTS } from './exercises';
import { DayPlan, Profile, RoutineBlock, RoutineItem } from './types';

export const todayKey = (d = new Date()) => {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

export const dateKeyOffset = (offset: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return todayKey(d);
};

export const calories = (met: number, weightKg: number, minutes: number) =>
  Math.round(met * 3.5 * weightKg / 200 * minutes);

const rng = (seed: number) => {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => (s = (s * 16807) % 2147483647) / 2147483647;
};

function hasEquip(ex: Exercise, owned: string[]) {
  if (ex.equipment.length === 0) return true;
  return ex.equipment.every((e) => owned.includes(e));
}

function safeFor(ex: Exercise, limitations: string[]) {
  if (limitations.includes('none')) return true;
  return !ex.avoidIf.some((a) => limitations.includes(a));
}

export function eligible(profile: Profile, types?: string[]) {
  const owned = [...profile.equipment, 'none'];
  const spaceRank = { yoga_mat: 0, small_room: 1, full_room: 2, terrace: 2 } as Record<string, number>;
  const exSpaceRank = { mat: 0, small: 1, open: 2 } as Record<string, number>;
  return EXERCISES.filter((ex) => {
    if (types && !types.includes(ex.type)) return false;
    if (!hasEquip(ex, owned)) return false;
    if (!safeFor(ex, profile.limitations)) return false;
    if (exSpaceRank[ex.space] > spaceRank[profile.space]) return false;
    if (profile.limitations.includes('heart') && ex.met > 6.5) return false;
    if (profile.limitations.includes('asthma') && ex.met > 6.5) return false;
    if (profile.limitations.includes('postpartum') && (ex.impact === 'medium' || ex.type === 'core')) return false;
    if (profile.limitations.includes('obesity') && ex.impact === 'medium') return false;
    return true;
  });
}

function toItem(ex: Exercise, seconds: number, idx: number): RoutineItem {
  return {
    id: `${ex.id}-${idx}`,
    exerciseId: ex.id,
    name: ex.name,
    hindi: ex.hindi,
    seconds,
    reps: ex.reps,
    cue: ex.cue,
    easier: ex.easier,
    harder: ex.harder,
  };
}

function pick<T>(arr: T[], n: number, r: () => number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  while (copy.length && out.length < n) {
    out.push(copy.splice(Math.floor(r() * copy.length), 1)[0]);
  }
  return out;
}

const SLOT_TIME: Record<string, string> = {
  early: '6:15 AM',
  morning: '9:30 AM',
  lunch: '1:30 PM',
  evening: '6:00 PM',
  night: '9:15 PM',
};

const HEADLINES: Record<number, { h: string; s: string }> = {
  1: { h: 'Running on empty today', s: 'We are doing the gentlest version. Showing up is the whole win.' },
  2: { h: 'Low battery day', s: 'Short, soft and silent. No pressure, no burn-outs.' },
  3: { h: 'Steady and doable', s: 'A balanced day of movement that fits between your chores.' },
  4: { h: 'Good energy today', s: 'Let us actually use it. Slightly harder, still home-friendly.' },
  5: { h: 'You are charged up', s: 'Full session unlocked. Your house is the gym today.' },
};

export function generateDayPlan(
  profile: Profile,
  energy: number,
  timeBudget: number,
  seedExtra = 0
): DayPlan {
  const date = todayKey();
  const r = rng(
    date.split('-').join('').split('').reduce((a, c) => a + c.charCodeAt(0), 0) + seedExtra * 97 + energy * 13
  );

  const intensityFactor = energy <= 2 ? 0.6 : energy === 3 ? 0.85 : 1;
  const levelFactor = profile.level === 'never' ? 0.75 : profile.level === 'restart' ? 0.85 : profile.level === 'light' ? 1 : 1.15;
  const scale = intensityFactor * levelFactor;

  const blocks: RoutineBlock[] = [];
  const slots = profile.preferredSlots.length ? profile.preferredSlots : ['morning', 'evening'];
  const primarySlot = slots[0];
  const secondarySlot = slots[1] || (primarySlot === 'night' ? 'morning' : 'night');

  const wantsCalm =
    energy <= 2 ||
    profile.goals.includes('stress_relief') ||
    profile.limitations.includes('postpartum');

  // ---------- Block 1: Wake-up / Warm-up micro ----------
  const warm = pick(eligible(profile, ['warmup']), energy <= 2 ? 3 : 4, r);
  blocks.push({
    id: 'wake',
    title: energy <= 2 ? 'Gentle Wake-Up' : 'Wake-Up Unlock',
    subtitle: 'Loosen the joints before the day grabs you',
    slot: primarySlot,
    timeLabel: SLOT_TIME[primarySlot] || '7:00 AM',
    kind: 'mobility',
    minutes: Math.max(3, Math.round(warm.reduce((a, e) => a + e.seconds, 0) / 60)),
    icon: 'sunny-outline',
    tint: 'mint',
    items: warm.map((e, i) => toItem(e, Math.round(e.seconds * (energy <= 2 ? 0.8 : 1)), i)),
    note: 'Do this before you even leave the bedroom.',
  });

  // ---------- Block 2: Main adaptive circuit ----------
  const mainMinutes = Math.max(4, Math.round(Math.min(timeBudget * 0.55, 28) * scale));
  const poolTypes = wantsCalm ? ['mobility', 'strength', 'breath'] : ['strength', 'cardio', 'core'];
  let pool = eligible(profile, poolTypes);
  if (pool.length < 4) pool = eligible(profile, ['warmup', 'strength', 'mobility']);

  const targetCount = Math.max(3, Math.min(8, Math.round(mainMinutes / 1.6)));
  const chosen = pick(pool, targetCount, r);
  const workSec = energy <= 2 ? 25 : energy === 3 ? 35 : 45;

  blocks.push({
    id: 'main',
    title: wantsCalm ? 'Slow Flow Circuit' : energy >= 4 ? 'Home Power Circuit' : 'Everyday Strength Circuit',
    subtitle: `${chosen.length} moves · ${workSec}s work · 15s rest · silent & neighbour-safe`,
    slot: secondarySlot,
    timeLabel: SLOT_TIME[secondarySlot] || '6:00 PM',
    kind: 'workout',
    minutes: Math.max(4, Math.round((chosen.length * (workSec + 15)) / 60)),
    icon: 'flame-outline',
    tint: 'warm',
    items: chosen.map((e, i) => toItem(e, workSec, i)),
    note: profile.barriers.includes('neighbours')
      ? 'Zero jumping in this circuit. Nobody downstairs will hear a thing.'
      : undefined,
  });

  // ---------- Block 3: Chore burn ----------
  const userChores = profile.chores.filter((c) => c !== 'none');
  const choreList = CHORE_WORKOUTS.filter((c) => userChores.includes(c.key));
  const chore = choreList.length ? choreList[Math.floor(r() * choreList.length)] : CHORE_WORKOUTS[0];
  const choreMin = Math.max(10, Math.min(profile.choreMinutes || 25, 45));
  blocks.push({
    id: 'chore',
    title: `Chore Burn: ${chore.label}`,
    subtitle: `${choreMin} min you were doing anyway — now it counts`,
    slot: 'morning',
    timeLabel: 'Whenever it happens',
    kind: 'chore',
    minutes: choreMin,
    icon: chore.icon,
    tint: 'violet',
    items: [
      {
        id: 'chore-1',
        exerciseId: 'chore',
        name: chore.label,
        hindi: 'Ghar ka kaam',
        seconds: choreMin * 60,
        cue: chore.tip,
        easier: 'Do it at your normal pace. It still counts.',
        harder: chore.upgrade,
      },
    ],
    note: chore.upgrade,
  });

  // ---------- Block 4: Micro-movement anchors ----------
  const microPool = eligible(profile, ['strength', 'core', 'mobility']).filter((e) => e.space === 'mat');
  const micros = pick(microPool, 3, r);
  const anchors = [
    'While the chai boils',
    'While brushing your teeth',
    profile.workHours >= 6 ? 'Between two work calls' : 'While the cooker whistles',
    'During the TV ad break',
  ];
  blocks.push({
    id: 'micro',
    title: 'Micro-Movement Anchors',
    subtitle: 'Three 60-second habits glued to things you already do',
    slot: 'lunch',
    timeLabel: 'Spread across the day',
    kind: 'micro',
    minutes: 3,
    icon: 'flash-outline',
    tint: 'mint',
    items: micros.map((e, i) => ({
      ...toItem(e, 60, i),
      cue: `${anchors[i % anchors.length]} — ${e.cue}`,
    })),
    note: 'These three minutes are the ones that actually build the habit.',
  });

  // ---------- Block 5: Wind-down ----------
  const cool = pick(eligible(profile, ['cooldown', 'breath']), 3, r);
  blocks.push({
    id: 'winddown',
    title: 'Wind-Down for Better Sleep',
    subtitle: `Aim to be in bed by ${profile.sleepTime}`,
    slot: 'night',
    timeLabel: SLOT_TIME.night,
    kind: 'mobility',
    minutes: Math.max(3, Math.round(cool.reduce((a, e) => a + e.seconds, 0) / 60)),
    icon: 'moon-outline',
    tint: 'violet',
    items: cool.map((e, i) => toItem(e, e.seconds, i)),
    note: 'Lights low, phone face-down. This is the block that fixes your energy tomorrow.',
  });

  const head = HEADLINES[Math.min(5, Math.max(1, energy))];

  return {
    date,
    energy,
    timeBudget,
    blocks,
    completed: [],
    checkedIn: true,
    headline: head.h,
    subline: head.s,
  };
}

export function emergencyPlan(profile: Profile, minutes: number): RoutineBlock {
  const r = rng(Date.now() % 100000);
  const pool = eligible(profile, minutes <= 3 ? ['warmup', 'mobility', 'breath'] : ['strength', 'core', 'cardio']);
  const n = Math.max(2, Math.min(6, Math.round(minutes / 1.2)));
  const chosen = pick(pool, n, r);
  return {
    id: `rescue-${Date.now()}`,
    title: `${minutes}-Minute Rescue`,
    subtitle: 'Made right now, for exactly the time you have',
    slot: 'now',
    timeLabel: 'Right now',
    kind: 'workout',
    minutes,
    icon: 'timer-outline',
    tint: 'warm',
    items: chosen.map((e, i) => toItem(e, Math.round((minutes * 60) / chosen.length) - 10, i)),
    note: 'No warm-up needed for this one. Just start.',
  };
}

export function bmi(profile: Profile) {
  const m = profile.heightCm / 100;
  return +(profile.weightKg / (m * m)).toFixed(1);
}

export function bmiBand(v: number) {
  if (v < 18.5) return { label: 'Underweight', color: '#4FA8FF' };
  if (v < 23) return { label: 'Healthy (Asian range)', color: '#27D9A3' };
  if (v < 27.5) return { label: 'Overweight (Asian range)', color: '#FFC53D' };
  return { label: 'High risk range', color: '#FF6B6B' };
}

export function dailyProteinTarget(profile: Profile) {
  return Math.round(profile.weightKg * (profile.goals.includes('get_stronger') ? 1.4 : 1.1));
}

export function nutritionTips(profile: Profile): { title: string; body: string; icon: string }[] {
  const tips: { title: string; body: string; icon: string }[] = [];
  const p = profile.foodPrefs;
  const veg = profile.diet === 'veg' || profile.diet === 'jain' || profile.diet === 'vegan';

  tips.push({
    title: `Aim for ~${dailyProteinTarget(profile)}g protein a day`,
    body: veg
      ? 'One katori dal (7g), one katori rajma/chana (9g), 100g paneer (18g), 1 cup dahi (6g). Stack three of these daily.'
      : 'Two eggs (12g), 100g chicken (27g), one katori dal (7g), one cup dahi (6g). Two of these covers most of it.',
    icon: 'egg-outline',
  });

  if (p.includes('rice_heavy') || p.includes('roti_sabzi')) {
    tips.push({
      title: 'Fix the plate order, not the food',
      body: 'Eat salad or sabzi first, then dal/curd, then roti or rice last. Same thali, slower sugar spike, less bloating.',
      icon: 'restaurant-outline',
    });
  }
  if (p.includes('tea_lover')) {
    tips.push({
      title: 'Chai is fine — the biscuits are not',
      body: 'Three cups with two sugars each is ~140 hidden calories daily. Drop to one sugar and pair chai with roasted chana instead of biscuits.',
      icon: 'cafe-outline',
    });
  }
  if (p.includes('skip_breakfast')) {
    tips.push({
      title: 'Skipping breakfast costs you at 4 PM',
      body: 'A 2-minute fix: one glass milk + soaked almonds, or leftover sabzi in a roti roll. It stops the evening namkeen binge.',
      icon: 'sunny-outline',
    });
  }
  if (p.includes('late_dinner')) {
    tips.push({
      title: 'Late dinner? Move the wind-down block',
      body: 'Do the spinal twist 45 minutes after eating instead of right before sleep. Better digestion, deeper sleep.',
      icon: 'moon-outline',
    });
  }
  if (p.includes('sweet_tooth')) {
    tips.push({
      title: 'Do not ban mithai',
      body: 'Ban the daily habit, keep the occasion. Have it after a meal, not on an empty stomach — the spike is much smaller.',
      icon: 'ice-cream-outline',
    });
  }
  if (p.includes('fasting')) {
    tips.push({
      title: 'On vrat days, train light',
      body: 'Keep it to the mobility and wind-down blocks. Rehydrate with nimbu-pani and have fruit + curd when you break the fast.',
      icon: 'flower-outline',
    });
  }
  if (p.includes('protein_low')) {
    tips.push({
      title: 'Your muscle is asking for dal',
      body: 'Without protein, exercise only makes you tired, not stronger. Add one extra katori of dal or a cup of dahi to every main meal.',
      icon: 'nutrition-outline',
    });
  }
  tips.push({
    title: 'Water before chai',
    body: 'Most "hunger" at 11 AM and 5 PM is dehydration. Two glasses of water before your next cup — you will eat noticeably less.',
    icon: 'water-outline',
  });
  return tips;
}
