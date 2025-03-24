import { ThemeColors } from './types';

export const getButtonStyle = (color: string, hoverColor: string) => ({
  color,
  '&:hover': {
    color: hoverColor,
  } as React.CSSProperties,
} as React.CSSProperties);

export const getBadgeStyle = (themeColors: ThemeColors) => ({
  backgroundColor: `${themeColors.accent}20`,
  color: themeColors.accent,
  borderColor: `${themeColors.accent}40`,
  '&:hover': {
    backgroundColor: `${themeColors.accentHover}30`,
    color: themeColors.accentHover,
  } as React.CSSProperties,
} as React.CSSProperties);
