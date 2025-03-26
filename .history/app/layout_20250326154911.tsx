import type React from 'react';
import type { Metadata, Viewport } from 'next/types';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import { AuthProvider } from '@/contexts/auth-context';
import { StoryProvider } from '@/contexts/story-context';
import { Toaster } from '@/components/ui/toaster';
import { PathnameInitializer } from '@/components/pathname-initializer';
import './globals.css';
import { SubscriptionProvider } from '@/contexts/subscription-context';
// Constants
const APP_NAME = 'Step Into Storytime';
const APP_DESCRIPTION = 'Create magical, personalized bedtime stories for children';
const DEFAULT_URL = 'http://localhost:3002';
// Initialize font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});
// Configure metadata
const createMetadataTitle = (template: string = '%s') => ({
  default: APP_NAME,
  template: `${template} | ${APP_NAME}`,
});
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || DEFAULT_URL),
  title: createMetadataTitle(),
  description: 'An interactive storytelling experience for children',
  openGraph: {
    title: createMetadataTitle(),
    description: APP_DESCRIPTION,
    type: 'website',
    siteName: APP_NAME,
  },
  twitter: {
    card: 'summary_large_image',
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
};
// Define viewport
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
};
// Provider wrapper component for better organization
const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ErrorBoundary>
    <ThemeProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <SubscriptionProvider>
          <StoryProvider>
            {children}
          </StoryProvider>
        </SubscriptionProvider>
      </AuthProvider>
    </ThemeProvider>
  </ErrorBoundary>
);
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <Providers>
          <PathnameInitializer />
          {children}
          <Toaster />
