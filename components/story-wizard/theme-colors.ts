import type { ThemeColors } from '../story/common/types';

export type ThemeType = keyof typeof themeColors;

export const themeColors: Record<string, ThemeColors> = {
  default: {
    primary: '#3b82f6',
    primaryHover: '#2563eb',
    secondary: '#64748b',
    secondaryHover: '#475569',
    accent: '#f59e0b',
    accentHover: '#d97706',
    background: '#ffffff',
    text: '#1e293b',
  },
  adventure: {
    primary: '#10b981',
    primaryHover: '#059669',
    secondary: '#6b7280',
    secondaryHover: '#4b5563',
    accent: '#f97316',
    accentHover: '#ea580c',
    background: '#f0fdf4',
    text: '#1c1917',
  },
  mystery: {
    primary: '#8b5cf6',
    primaryHover: '#7c3aed',
    secondary: '#6b7280',
    secondaryHover: '#4b5563',
    accent: '#ec4899',
    accentHover: '#db2777',
    background: '#f5f3ff',
    text: '#1e1b4b',
  },
  fantasy: {
    primary: '#f43f5e',
    primaryHover: '#e11d48',
    secondary: '#6b7280',
    secondaryHover: '#4b5563',
    accent: '#f59e0b',
    accentHover: '#d97706',
    background: '#fff1f2',
    text: '#1e293b',
  },
} as const;
