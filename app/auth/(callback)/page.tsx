// Auth callback handler
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
        console.log('Auth callback session check:', { session, error });

        if (error) {
          console.error('Session error:', error);
          throw error;
        }

        if (session) {
          console.log('Redirecting to dashboard...');
          await router.replace('/dashboard');
        } else {
          console.log('No session found, redirecting to sign-in...');
          await router.replace('/sign-in');
        }
      } catch (error) {
        console.error('Error in auth callback:', error);
        await router.replace('/sign-in');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-center">
        <h2 className="text-2xl font-semibold mb-4">
          Completing authentication...
        </h2>
        <p className="text-gray-600">
          Please wait while we verify your credentials.
        </p>
      </div>
    </div>
  );
}
