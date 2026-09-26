import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

let on = true;
export const setHaptics = (v: boolean) => {
  on = v;
};

export const tap = (style: 'light' | 'medium' | 'heavy' | 'success' = 'light') => {
  if (!on || Platform.OS === 'web') return;
  try {
    if (style === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else
      Haptics.impactAsync(
        style === 'heavy'
          ? Haptics.ImpactFeedbackStyle.Heavy
          : style === 'medium'
          ? Haptics.ImpactFeedbackStyle.Medium
          : Haptics.ImpactFeedbackStyle.Light
      );
  } catch {
    /* ignore */
  }
};
