'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar/index';
import Footer from '@/components/sections/footer';
import StoryWizard from '@/components/story-wizard/StoryWizard';
import { StoryWizardHeader } from '@/components/story-wizard/StoryWizardHeader';
import Loading from '@/components/loading';
import { useAuth } from '@/contexts/auth-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Story } from '@/components/story/common/types';

export default function CreateStoryPage() {
  const router = useRouter();
  const { state: authState } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Add debugging logs to check authentication state
  useEffect(() => {
    const checkAuth = async () => {
      console.log('[DEBUG] Auth state:', {
        isLoading: authState.isLoading,
        isInitialized: authState.isInitialized,
        isAuthenticated: authState.isAuthenticated,
      });

      // Wait for auth state to be initialized
      if (authState.isLoading || !authState.isInitialized) {
        return;
      }

      // Only redirect if we're sure about the auth state and not already redirecting
      if (!authState.isAuthenticated && !isRedirecting) {
        console.log('[DEBUG] Not authenticated, redirecting to sign-in');
        setIsRedirecting(true);
        // Store the current URL to redirect back after login
        const returnUrl = encodeURIComponent(window.location.pathname);
        router.push(`/sign-in?returnUrl=${returnUrl}`);
      }
    };

    checkAuth();
  }, [
    authState.isLoading,
    authState.isAuthenticated,
    authState.isInitialized,
    router,
    isRedirecting,
  ]);

  // If still loading auth state or redirecting, show loading indicator
  if (authState.isLoading || !authState.isInitialized || isRedirecting) {
    return <Loading />;
  }

  // If not authenticated, don't render the page content
  if (!authState.isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  const handleStoryComplete = (story: Story) => {
    // Navigate to the story view page
    router.push(`/story/${story.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="max-w-4xl w-full">
          {/* Fun animated header */}
          <StoryWizardHeader />

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="flex items-center gap-2">
                {error}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setError(null)}
                >
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Story creation wizard */}
          <div className="mt-6">
            <Suspense fallback={<Loading />}>
              <StoryWizard
                onComplete={handleStoryComplete}
                onError={setError}
              />
            </Suspense>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
