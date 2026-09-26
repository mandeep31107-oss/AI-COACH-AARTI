export type ThemeMode = 'dark' | 'light';

export interface Theme {
  mode: ThemeMode;
  bg: string;
  bgElevated: string;
  card: string;
  cardAlt: string;
  border: string;
  text: string;
  textDim: string;
  textFaint: string;
  primary: string;
  primarySoft: string;
  accent: string;
  accentSoft: string;
  violet: string;
  violetSoft: string;
  danger: string;
  warn: string;
  gradWarm: [string, string];
  gradMint: [string, string];
  gradViolet: [string, string];
  gradHero: [string, string, string];
  shadow: string;
}

export const darkTheme: Theme = {
  mode: 'dark',
  bg: '#0A0D14',
  bgElevated: '#111621',
  card: '#151B27',
  cardAlt: '#1C2333',
  border: 'rgba(255,255,255,0.08)',
  text: '#F3F6FB',
  textDim: '#A3ADC2',
  textFaint: '#6B7590',
  primary: '#FF8A3D',
  primarySoft: 'rgba(255,138,61,0.14)',
  accent: '#27D9A3',
  accentSoft: 'rgba(39,217,163,0.14)',
  violet: '#8B7BFF',
  violetSoft: 'rgba(139,123,255,0.16)',
  danger: '#FF6B6B',
  warn: '#FFC53D',
  gradWarm: ['#FF9A4D', '#FF5F6D'],
  gradMint: ['#2BE3A7', '#12A2B8'],
  gradViolet: ['#9C7BFF', '#5B5BF5'],
  gradHero: ['#1B1030', '#241533', '#0E1220'],
  shadow: '#000000',
};

export const lightTheme: Theme = {
  mode: 'light',
  bg: '#F6F4F0',
  bgElevated: '#FFFFFF',
  card: '#FFFFFF',
  cardAlt: '#F1EEE8',
  border: 'rgba(20,24,35,0.08)',
  text: '#141823',
  textDim: '#5A6376',
  textFaint: '#8C95A8',
  primary: '#E8722A',
  primarySoft: 'rgba(232,114,42,0.12)',
  accent: '#0FA97C',
  accentSoft: 'rgba(15,169,124,0.12)',
  violet: '#6A57E6',
  violetSoft: 'rgba(106,87,230,0.12)',
  danger: '#E04848',
  warn: '#D99408',
  gradWarm: ['#FF9A4D', '#FF5F6D'],
  gradMint: ['#2BE3A7', '#12A2B8'],
  gradViolet: ['#9C7BFF', '#5B5BF5'],
  gradHero: ['#FFE9D6', '#FFF3E6', '#F6F4F0'],
  shadow: '#5A4636',
};

export const radius = { sm: 10, md: 16, lg: 22, xl: 28, pill: 999 };
export const spacing = { xs: 6, sm: 10, md: 16, lg: 22, xl: 30 };
