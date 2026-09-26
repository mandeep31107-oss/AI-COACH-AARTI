import { BARRIERS, CHORE_WORKOUTS, SUBSTITUTES } from './exercises';
import { bmi, bmiBand, dailyProteinTarget } from './engine';
import { LogEntry, Profile } from './types';

export interface CoachReply {
  text: string;
  action?: { label: string; kind: 'rescue' | 'plan' | 'house' | 'progress'; minutes?: number };
  chips?: string[];
}

const firstName = (p: Profile) => (p.name || 'friend').split(' ')[0];

const pickOne = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export const QUICK_PROMPTS = [
  'I am too tired today',
  'I only have 5 minutes',
  'I missed 3 days',
  'My knees hurt',
  'I have no equipment',
  'What should I eat tonight?',
  'How am I doing?',
  'I feel guilty resting',
  'Neighbours complain about noise',
];

export function coachReply(input: string, profile: Profile, logs: LogEntry[], streak: number): CoachReply {
  const q = input.toLowerCase();
  const name = firstName(profile);

  const has = (...k: string[]) => k.some((w) => q.includes(w));

  if (has('tired', 'exhaust', 'thak', 'no energy', 'drained', 'sleepy')) {
    return {
      text: `Alright ${name}, we are not negotiating with exhaustion today. On a tired day the goal is blood flow, not burn. Give me 4 minutes of the wind-down flow — legs up the wall, spinal twist and slow breathing. That is a complete day in my book, and your streak stays alive.`,
      action: { label: 'Start a 4-minute recovery flow', kind: 'rescue', minutes: 4 },
      chips: ['Okay, start it', 'I still feel guilty'],
    };
  }

  if (has('5 minute', 'five minute', 'no time', 'busy', 'rush', '10 minute', 'short')) {
    const m = q.includes('10') ? 10 : q.includes('3') ? 3 : 5;
    return {
      text: `Perfect. ${m} minutes is not a compromise, it is the plan. I will build a silent circuit right now that needs one chatai of space and nothing else. No warm-up, no equipment, no excuses needed.`,
      action: { label: `Generate a ${m}-minute rescue workout`, kind: 'rescue', minutes: m },
    };
  }

  if (has('miss', 'skipped', 'break', 'gap', 'restart', 'start again', 'failed', 'give up')) {
    return {
      text: `You did not fail, ${name}. You paused. Everyone who has ever gotten fit has paused — the only difference is they came back, exactly like you are doing right now. We are not making up for lost days. We start today at half the usual load and rebuild from there.`,
      action: { label: 'Rebuild with a gentle 6-minute restart', kind: 'rescue', minutes: 6 },
      chips: ['Let us restart', 'Show me my progress'],
    };
  }

  if (has('knee', 'back pain', 'shoulder', 'wrist', 'pain', 'hurt', 'injur')) {
    const part = q.includes('knee') ? 'knees' : q.includes('back') ? 'lower back' : q.includes('shoulder') ? 'shoulders' : 'joints';
    return {
      text: `Thanks for telling me. I have already removed every move that loads your ${part} from your plan — no jumping, no deep squats, no floor impact. We will use chair-supported strength, glute bridges and wall work instead. If there is sharp pain rather than muscle effort, stop and see a doctor. I will never push you through pain.`,
      action: { label: 'Give me a joint-friendly 8-minute session', kind: 'rescue', minutes: 8 },
    };
  }

  if (has('equipment', 'gym', 'dumbbell', 'weights', 'machine')) {
    const s = pickOne(SUBSTITUTES);
    return {
      text: `You already own a gym, ${name}. Example: ${s.have} replaces ${s.instead.toLowerCase()} perfectly. Two full water bottles, your atta bag and the staircase cover strength, load and cardio. Open Turn Your House Into Your Gym and I will map every room for you.`,
      action: { label: 'Open my House Gym', kind: 'house' },
    };
  }

  if (has('noise', 'neighbour', 'neighbor', 'downstairs', 'jump', 'quiet', 'silent')) {
    return {
      text: `Every single move in your plan is silent by design — step-out jacks instead of jumping jacks, step-touch instead of running in place, and bodyweight holds instead of thuds. Roll out a mat or a folded bedsheet and nobody below you will hear a thing.`,
      action: { label: 'Try a silent 7-minute circuit', kind: 'rescue', minutes: 7 },
    };
  }

  if (has('space', 'small', 'room', 'flat', 'ghar chhota')) {
    return {
      text: `Your entire routine is built for a 6 by 3 foot patch — exactly one chatai. If you can lie down and stretch your arms out, you have enough. Push the centre table a foot aside and the living room becomes a studio.`,
      action: { label: 'See room-by-room setups', kind: 'house' },
    };
  }

  if (has('eat', 'food', 'diet', 'khana', 'protein', 'roti', 'rice', 'dinner', 'breakfast')) {
    const veg = profile.diet === 'veg' || profile.diet === 'jain' || profile.diet === 'vegan';
    return {
      text: `Nothing exotic, ${name}. Target roughly ${dailyProteinTarget(profile)}g of protein a day. ${
        veg
          ? 'One katori dal is 7g, a katori of rajma or chana is 9g, 100g paneer is 18g and a cup of dahi is 6g.'
          : 'Two eggs give 12g, 100g chicken gives 27g, a katori of dal 7g and a cup of dahi 6g.'
      } Keep your thali exactly as it is, just eat sabzi and dal before the roti or rice. Same food, much steadier energy.`,
      chips: ['More food tips', 'What about chai?'],
    };
  }

  if (has('chai', 'tea', 'sugar', 'sweet', 'mithai')) {
    return {
      text: `I am not taking your chai away. Three cups with two sugars is about 140 hidden calories a day, which is roughly 5kg a year. Drop to one sugar and swap biscuits for roasted chana or makhana. Do not ban mithai either — have it after a meal instead of on an empty stomach.`,
    };
  }

  if (has('progress', 'how am i', 'doing', 'stats', 'streak', 'result')) {
    const total = logs.reduce((a, l) => a + l.minutes, 0);
    const cal = logs.reduce((a, l) => a + l.calories, 0);
    return {
      text:
        logs.length === 0
          ? `We have not logged anything yet, ${name} — and that is completely fine, day zero is where everybody starts. Finish one block today and I will start tracking everything for you.`
          : `You have moved for ${total} minutes across ${logs.length} sessions and burned roughly ${cal} calories. Current streak: ${streak} day${streak === 1 ? '' : 's'}. The number I care about most is consistency, not intensity — and yours is heading the right way.`,
      action: { label: 'Open my dashboard', kind: 'progress' },
    };
  }

  if (has('guilt', 'selfish', 'family', 'chores', 'ghar ka kaam', 'housework', 'kids', 'bachche')) {
    const chore = pickOne(CHORE_WORKOUTS);
    return {
      text: `Taking 10 minutes for your body is not selfish, ${name} — it is maintenance on the person everyone at home depends on. And your housework already counts: ${chore.label.toLowerCase()} burns roughly ${Math.round(
        chore.met * 3.5 * profile.weightKg / 200 * 30
      )} calories in 30 minutes. ${chore.tip}`,
      action: { label: 'Log my chores as a workout', kind: 'plan' },
    };
  }

  if (has('motivat', 'lazy', 'mann nahi', 'do not feel', 'dont feel', 'bored', 'sad', 'depress', 'low')) {
    const barrier = profile.barriers.length ? BARRIERS.find((b) => b.key === profile.barriers[0]) : null;
    return {
      text: `Motivation is not the entry ticket, ${name} — it shows up after you start, not before. So we lower the bar until it is silly: two minutes, in whatever clothes you are wearing. ${
        barrier ? barrier.reframe : 'No judgement here, ever.'
      }`,
      action: { label: 'Just 2 minutes, nothing more', kind: 'rescue', minutes: 2 },
    };
  }

  if (has('weight', 'lose', 'fat', 'belly', 'motapa', 'slim')) {
    const v = bmi(profile);
    const band = bmiBand(v);
    return {
      text: `Your BMI is ${v} — ${band.label.toLowerCase()} on the Asian scale, which is stricter than the Western one for good reason. Belly fat does not respond to crunches, it responds to a small daily calorie gap plus more muscle. Keep the circuit three times a week, walk after dinner, and fix the plate order. Expect real change in 8 to 10 weeks, not 10 days.`,
      action: { label: 'Show me my plan', kind: 'plan' },
    };
  }

  if (has('sleep', 'insomnia', 'neend', 'night')) {
    return {
      text: `Your wind-down block exists exactly for this. Legs up the wall for three minutes, a lying spinal twist, then 4-7-8 breathing — all in bed with the lights low. Target lights-out at ${profile.sleepTime}. Bad sleep is the number one reason tomorrow feels impossible.`,
      action: { label: 'Start the wind-down flow', kind: 'rescue', minutes: 5 },
    };
  }

  if (has('hi', 'hello', 'hey', 'namaste', 'start', 'ready')) {
    return {
      text: `Namaste ${name}. Good to see you. Tell me honestly how today feels — tired, rushed, or actually decent — and I will reshape the plan around it. No judgement, ever.`,
      chips: QUICK_PROMPTS.slice(0, 4),
    };
  }

  if (has('thank', 'thanks', 'shukriya')) {
    return { text: `Any time, ${name}. Show up tomorrow, even for two minutes. That is all I ask.` };
  }

  return {
    text: `I hear you, ${name}. Here is how I can actually help right now: reshape today around your energy, build an instant rescue workout for the exact minutes you have, turn your chores into logged movement, or walk you through your house gym. Which one?`,
    chips: ['Build me a quick workout', 'I am too tired today', 'How am I doing?'],
  };
}

export const NO_JUDGEMENT_LINES = [
  'A 2-minute day still counts. It keeps the identity alive.',
  'You are not behind. There is no race here.',
  'Rest days are part of training, not a break from it.',
  'Consistency beats intensity every single time.',
  'Your chores are real movement. We count them properly.',
  'Nobody is watching. No leaderboard, no comparison.',
  'Start before you feel ready — motivation follows action.',
  'The plan bends to your life. Your life does not bend to the plan.',
];

export function motivationLine(streak: number, todayMinutes: number, motivation: number) {
  if (todayMinutes > 0 && streak >= 7) return `${streak} days straight. This is no longer a phase, it is who you are.`;
  if (todayMinutes > 0) return `${todayMinutes} minutes logged today. That is a win, full stop.`;
  if (streak > 0) return `${streak}-day streak alive. Two minutes today keeps it breathing.`;
  if (motivation <= 4) return 'We are starting from a low tank today. Perfect. The bar is deliberately low.';
  return 'Fresh start. Pick one block, any block, and just begin.';
}

export function computeStreak(logs: LogEntry[]): number {
  if (!logs.length) return 0;
  const days = new Set(logs.map((l) => l.date));
  let streak = 0;
  const d = new Date();
  const key = (x: Date) => {
    const p = (n: number) => String(n).padStart(2, '0');
    return `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}`;
  };
  if (!days.has(key(d))) d.setDate(d.getDate() - 1);
  while (days.has(key(d))) {
    streak += 1;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

export interface Badge {
  key: string;
  label: string;
  desc: string;
  icon: string;
  earned: boolean;
}

export function badges(logs: LogEntry[], streak: number): Badge[] {
  const total = logs.reduce((a, l) => a + l.minutes, 0);
  const chores = logs.filter((l) => l.kind === 'chore').length;
  const micros = logs.filter((l) => l.kind === 'micro').length;
  const days = new Set(logs.map((l) => l.date)).size;
  return [
    { key: 'first', label: 'First Move', desc: 'Complete your first block', icon: 'footsteps-outline', earned: logs.length >= 1 },
    { key: 'streak3', label: '3-Day Spark', desc: 'Move 3 days in a row', icon: 'flame-outline', earned: streak >= 3 },
    { key: 'streak7', label: 'Week Warrior', desc: '7-day streak', icon: 'trophy-outline', earned: streak >= 7 },
    { key: 'chore5', label: 'Ghar Ka Gym', desc: 'Log 5 chore workouts', icon: 'home-outline', earned: chores >= 5 },
    { key: 'micro10', label: 'Micro Master', desc: '10 micro-movement wins', icon: 'flash-outline', earned: micros >= 10 },
    { key: 'min100', label: '100 Minutes', desc: '100 total movement minutes', icon: 'time-outline', earned: total >= 100 },
    { key: 'min500', label: '500 Club', desc: '500 total minutes', icon: 'medal-outline', earned: total >= 500 },
    { key: 'days20', label: 'Twenty Days', desc: 'Move on 20 different days', icon: 'calendar-outline', earned: days >= 20 },
  ];
}
