export type ThemeType = 'friendship' | 'courage' | 'discovery' | 'kindness' | 'imagination' | 'teamwork' | 'default';

type ThemeColors = {
  [key in ThemeType]: {
    primary: string;
    secondary: string;
    accent: string;
  };
};

export const themeColors: ThemeColors = {
  friendship: {
    primary: '#FF6B6B',
    secondary: '#4ECDC4',
    accent: '#45B7D1',
  },
  courage: {
    primary: '#4D96FF',
    secondary: '#6BCB77',
    accent: '#FFD93D',
  },
  discovery: {
    primary: '#9C27B0',
    secondary: '#2196F3',
    accent: '#FF9800',
  },
  kindness: {
    primary: '#FF96AD',
    secondary: '#B5DEFF',
    accent: '#AFF6D6',
  },
  imagination: {
    primary: '#A78BFA',
    secondary: '#34D399',
    accent: '#F472B6',
  },
  teamwork: {
    primary: '#0EA5E9',
    secondary: '#A3E635',
    accent: '#FB923C',
  },
  default: {
    primary: '#8B5CF6',
    secondary: '#FF9800',
    accent: '#2DD4BF',
  },
} as const;
