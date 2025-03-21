import type React from 'react';
import type { Metadata, Viewport } from 'next/types';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/auth-context';
import { StoryProvider } from '@/contexts/story-context';
import { Toaster } from '@/components/ui/toaster';
import '@/styles/globals.css';
import { SubscriptionProvider } from '@/contexts/subscription-context';

// Initialize font
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

// Define metadata
export const metadata: Metadata = {
  title: 'Step Into Storytime',
  description: 'Create magical, personalized stories for children',
  openGraph = {
    title: 'Step Into Storytime',
    description: 'Create magical, personalized stories for children',
    type: 'website',
  },
  twitter = {
    card: 'summary_large_image',
    title: 'Step Into Storytime',
    description: 'Create magical, personalized stories for children',
  },
};

// Define viewport
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
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
      </body>
    </html>
  );
}
