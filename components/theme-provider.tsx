'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';

type Props = {
  children: React.ReactNode;
  defaultTheme?: string;
  themes?: string[];
  forcedTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  enableColorScheme?: boolean;
};

type Attribute = string;

type ThemeProviderProps = Omit<
  React.ComponentProps<typeof NextThemesProvider>,
  'attribute'
> & {
  children: React.ReactNode;
  attribute?: string[];
};

export function ThemeProvider(props: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeWrapper>{props.children}</ThemeWrapper>
    </NextThemesProvider>
  );
}

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  const className = cn(
    'min-h-screen bg-background font-sans antialiased',
    'transition-colors duration-300',
    theme === 'dark' ? 'dark' : '',
    'text-foreground',
    '[--story-primary:theme(colors.blue.500)]',
    '[--story-secondary:theme(colors.blue.400)]',
    '[--story-accent:theme(colors.violet.500)]',
    '[--story-background:theme(colors.white)]',
    '[--story-text:theme(colors.slate.800)]',
    '[--story-heading:theme(colors.slate.900)]',
    '[--story-border:theme(colors.slate.200)]',
    'dark:[--story-primary:theme(colors.blue.400)]',
    'dark:[--story-secondary:theme(colors.blue.300)]',
    'dark:[--story-accent:theme(colors.violet.400)]',
    'dark:[--story-background:theme(colors.slate.900)]',
    'dark:[--story-text:theme(colors.slate.200)]',
    'dark:[--story-heading:theme(colors.white)]',
    'dark:[--story-border:theme(colors.slate.800)]'
  );

  console.log('Current theme:', theme);
  console.log('Generated class names:', className);

  return <div className={className}>{children}</div>;
}

// Utility function for combining class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
