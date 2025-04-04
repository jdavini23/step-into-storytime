import type React from 'react';
import type { Metadata, Viewport } from 'next/types';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import { AuthProvider } from '@/contexts/auth-context';
import { StoryProvider } from '@/contexts/story-context';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { SubscriptionProvider } from '@/contexts/subscription-context';

// Initialize font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Define metadata
export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3002'
  ),
  title: {
    default: 'Step Into Storytime',
    template: '%s | Step Into Storytime',
  },
  description: 'An interactive storytelling experience for children',
  openGraph: {
    title: {
      default: 'Step Into Storytime',
      template: '%s | Step Into Storytime',
    },
    description: 'Create magical, personalized bedtime stories for children',
    type: 'website',
    siteName: 'Step Into Storytime',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Step Into Storytime',
    description: 'Create magical, personalized bedtime stories for children',
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
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
                  <Toaster />
                </StoryProvider>
              </SubscriptionProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
