import * as Speech from 'expo-speech';
import { Platform } from 'react-native';

let enabled = true;
let rate = 0.95;

export const voice = {
  configure(on: boolean, r: number) {
    enabled = on;
    rate = r;
    if (!on) voice.stop();
  },
  speak(text: string, opts?: { force?: boolean; pitch?: number }) {
    if (!enabled && !opts?.force) return;
    try {
      Speech.stop();
      Speech.speak(text, {
        rate: Platform.OS === 'web' ? rate : rate * 0.98,
        pitch: opts?.pitch ?? 1.05,
        language: 'en-IN',
      });
    } catch {
      /* speech unavailable */
    }
  },
  stop() {
    try {
      Speech.stop();
    } catch {
      /* ignore */
    }
  },
};
