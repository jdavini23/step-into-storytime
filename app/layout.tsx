import type React from "react"
import type { Metadata, Viewport } from "next/types"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { ErrorBoundary } from "@/components/error-boundary"
import { AuthProvider } from "@/contexts/auth-context"
import { StoryProvider } from "@/contexts/story-context"
import { Toaster } from "@/components/ui/toaster"
import "@/app/globals.css"
import { SubscriptionProvider } from "@/contexts/subscription-context"

// Initialize font
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

// Define metadata
export const metadata: Metadata = {
  title: {
    template: "%s | Step Into Storytime",
    default: "Step Into Storytime - AI-Powered Bedtime Stories",
  },
  description: "Create magical, personalized bedtime stories for children with AI technology",
  keywords: [
    "bedtime stories",
    "children stories",
    "AI stories",
    "personalized stories",
    "storytelling",
    "kids",
    "learning",
  ],
  authors: [{ name: "Step Into Storytime Team" }],
  creator: "Step Into Storytime",
  publisher: "Step Into Storytime",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://stepintostorytime.com",
    title: "Step Into Storytime - AI-Powered Bedtime Stories",
    description: "Create magical, personalized bedtime stories for children with AI technology",
    siteName: "Step Into Storytime",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Step Into Storytime - AI-Powered Bedtime Stories",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Step Into Storytime - AI-Powered Bedtime Stories",
    description: "Create magical, personalized bedtime stories for children with AI technology",
    images: ["/images/twitter-image.jpg"],
  },
    generator: 'v0.dev'
}

// Define viewport
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-background font-sans antialiased">
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
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
  )
}



import './globals.css'