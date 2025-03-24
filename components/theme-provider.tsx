'use client';

import * as React from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  themes?: string[];
  forcedTheme?: string;
  enableSystem?: boolean;
  disableTransitionOnChange?: boolean;
  enableColorScheme?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  enableSystem = true,
  disableTransitionOnChange = false,
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      {...props}
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem={enableSystem}
      disableTransitionOnChange={disableTransitionOnChange}
    >
      <ThemeWrapper>{children}</ThemeWrapper>
    </NextThemesProvider>
  );
}

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <div
      className={cn(
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
      )}
    >
      {children}
    </div>
  );
}

// Utility function for combining class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
