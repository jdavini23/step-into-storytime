'use client';

import * as React from 'react';
import { ThemeProvider } from '@/components/theme-provider';

export function ThemeWrapperClient({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </ThemeProvider>
  );
}
