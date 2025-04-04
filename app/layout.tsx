import type React from 'react';
import type { Metadata, Viewport } from 'next/types';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { ErrorBoundary } from '@/components/error-boundary';
import { AuthProvider } from '@/contexts/auth-context';
import { SubscriptionProvider } from '@/contexts/subscription-context';
import { ServiceWorkerRegistration } from '@/components/service-worker';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

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
    default: "Step Into Storytime - Personalized Children's Stories",
    template: '%s | Step Into Storytime',
  },
  description:
    "Create personalized children's stories with AI magic. Choose characters, settings, and themes to craft unique tales for your little ones.",
  keywords: [
    "children's stories",
    'personalized books',
    'AI stories',
    'bedtime stories',
    'interactive stories',
  ],
  authors: [{ name: 'Step Into Storytime Team' }],
  creator: 'Step Into Storytime',
  publisher: 'Step Into Storytime',
  viewport: 'width=device-width, initial-scale=1',
};

// Define viewport
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log(
    '[DEBUG-LAYOUT] Rendering RootLayout, pathname:',
    typeof window !== 'undefined' ? window.location.pathname : 'server'
  );

  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                console.log('Current theme:', localStorage.getItem('theme'));
                if (localStorage.getItem('theme') === 'dark' ||
                  (!('theme' in localStorage) &&
                    window.matchMedia('(prefers-color-scheme: dark)').matches)
                ) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {
                console.error('Theme detection failed:', e);
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <AuthProvider>
              <SubscriptionProvider>
                {children}
                <Toaster />
                <ServiceWorkerRegistration />
              </SubscriptionProvider>
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
