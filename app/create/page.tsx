'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import Footer from '@/components/sections/footer';
import StoryWizard from '@/components/story-wizard/StoryWizard';
import Loading from '@/components/loading';
import { useAuth } from '@/contexts/auth-context';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { StoryData } from '@/components/story/common/types';

export default function CreateStoryPage() {
  const router = useRouter();
  const { state: authState } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Check authentication status
  useEffect(() => {
    if (!authState.isLoading && !authState.isAuthenticated) {
      // Redirect to sign-in page with return URL
      router.push(`/sign-in?returnUrl=${encodeURIComponent('/create')}`);
    }
  }, [authState.isLoading, authState.isAuthenticated, router]);

  // If still loading auth state, show loading indicator
  if (authState.isLoading) {
    return <Loading />;
  }

  // If not authenticated, don't render the page content
  if (!authState.isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  const handleStoryComplete = (story: StoryData) => {
    // Navigate to the story view page
    router.push(`/story/${story.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-violet-50">
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 pt-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
              Create Your Story
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Let's craft a magical story together! I'll guide you through the
              process with a few simple questions.
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {error}
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={() => setError(null)}
                >
                  Dismiss
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {/* Wrap StoryWizard in Suspense to handle any potential loading issues */}
          <Suspense fallback={<Loading />}>
            <StoryWizard
              onComplete={handleStoryComplete}
              onError={(errorMessage) => setError(errorMessage)}
            />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
