export type ThemeType = 'friendship' | 'courage' | 'discovery' | 'kindness' | 'imagination' | 'teamwork' | 'default';

type ThemeColorSet = {
  [key in ThemeType]: {
    primary: string;
    primaryHover: string;
    secondary: string;
    secondaryHover: string;
    accent: string;
    accentHover: string;
    text: string;
  };
};

export const themeColors: ThemeColorSet = {
  friendship: {
    primary: '#FF6B6B',
    primaryHover: '#FF8787',
    secondary: '#4ECDC4',
    secondaryHover: '#6AD5CE',
    accent: '#45B7D1',
    accentHover: '#5DC5DC',
    text: '#2D3748',
  },
  courage: {
    primary: '#4D96FF',
    primaryHover: '#6BA8FF',
    secondary: '#6BCB77',
    secondaryHover: '#83D58E',
    accent: '#FFD93D',
    accentHover: '#FFE066',
    text: '#2D3748',
  },
  discovery: {
    primary: '#9B59B6',
    primaryHover: '#B07CC6',
    secondary: '#3498DB',
    secondaryHover: '#5FAEE3',
    accent: '#F1C40F',
    accentHover: '#F4D03F',
    text: '#2D3748',
  },
  kindness: {
    primary: '#E84393',
    primaryHover: '#ED65A9',
    secondary: '#00B894',
    secondaryHover: '#1ACC9F',
    accent: '#FDCB6E',
    accentHover: '#FFD88B',
    text: '#2D3748',
  },
  imagination: {
    primary: '#6C5CE7',
    primaryHover: '#8B7DEC',
    secondary: '#00CEC9',
    secondaryHover: '#1AD9D4',
    accent: '#FFA502',
    accentHover: '#FFB733',
    text: '#2D3748',
  },
  teamwork: {
    primary: '#0984E3',
    primaryHover: '#2B97E8',
    secondary: '#00B894',
    secondaryHover: '#1ACC9F',
    accent: '#FDCB6E',
    accentHover: '#FFD88B',
    text: '#2D3748',
  },
  default: {
    primary: '#4A5568',
    primaryHover: '#718096',
    secondary: '#718096',
    secondaryHover: '#A0AEC0',
    accent: '#A0AEC0',
    accentHover: '#CBD5E0',
    text: '#2D3748',
  },
};
