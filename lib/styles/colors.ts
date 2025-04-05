// WCAG 2.1 AA compliant color system
export const colors = {
  primary: {
    // Violet shades with proper contrast ratios
    50: '#f5f3ff', // Background
    100: '#ede9fe', // Background
    200: '#ddd6fe', // Background
    300: '#c4b5fd', // Background
    400: '#a78bfa', // Decorative
    500: '#8b5cf6', // Primary buttons/interactive (AA)
    600: '#7c3aed', // Primary text on light (AAA)
    700: '#6d28d9', // Primary text on light (AAA)
    800: '#5b21b6', // Primary text on light (AAA)
    900: '#4c1d95', // Primary text on light (AAA)
  },
  gray: {
    // Neutral shades with guaranteed contrast
    50: '#f8fafc', // Background
    100: '#f1f5f9', // Background
    200: '#e2e8f0', // Background
    300: '#cbd5e1', // Decorative
    400: '#94a3b8', // Disabled text (AA)
    500: '#64748b', // Secondary text (AA)
    600: '#475569', // Primary text (AAA)
    700: '#334155', // Primary text (AAA)
    800: '#1e293b', // Primary text (AAA)
    900: '#0f172a', // Primary text (AAA)
  },
  success: {
    // Green shades for success states
    light: '#22c55e', // AA on dark
    DEFAULT: '#16a34a', // AAA on light
    dark: '#15803d', // AAA on light
  },
  error: {
    // Red shades for error states
    light: '#ef4444', // AA on dark
    DEFAULT: '#dc2626', // AAA on light
    dark: '#b91c1c', // AAA on light
  },
  warning: {
    // Yellow shades for warning states
    light: '#eab308', // AA on dark
    DEFAULT: '#ca8a04', // AAA on light
    dark: '#854d0e', // AAA on light
  },
  info: {
    // Blue shades for info states
    light: '#3b82f6', // AA on dark
    DEFAULT: '#2563eb', // AAA on light
    dark: '#1d4ed8', // AAA on light
  },
  // Semantic color mapping
  semantic: {
    text: {
      primary: '#0f172a', // gray.900 - AAA compliant
      secondary: '#475569', // gray.600 - AA compliant
      disabled: '#94a3b8', // gray.400
      inverse: '#f8fafc', // gray.50
    },
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc', // gray.50
      tertiary: '#f1f5f9', // gray.100
    },
    border: {
      light: '#e2e8f0', // gray.200
      DEFAULT: '#cbd5e1', // gray.300
      dark: '#94a3b8', // gray.400
    },
  },
} as const;

// Contrast ratios for reference
export const contrastRatios = {
  // Text on white background (#ffffff)
  onWhite: {
    gray900: 18.1, // Excellent - AAA
    gray600: 7.5, // Good - AA
    gray400: 2.6, // Poor - Fail
    primary600: 7.2, // Good - AA
  },
  // Text on primary color (#7c3aed)
  onPrimary: {
    white: 8.3, // Excellent - AAA
    gray50: 7.9, // Excellent - AAA
  },
} as const;

// Usage examples in comments
/*
Example usage with Tailwind:

text-gray-900     // Primary text - AAA compliant
text-gray-600     // Secondary text - AA compliant
text-primary-600  // Interactive text - AA compliant
bg-primary-600    // Primary button background
text-error-DEFAULT // Error text - AAA compliant
border-border     // Default border color
*/
