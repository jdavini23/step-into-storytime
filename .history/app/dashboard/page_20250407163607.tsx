'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export default function DashboardPage() {
  const router = useRouter();
  const { state: authState } = useAuth();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Add debug logs to inspect authentication state
  useEffect(() => {
    console.log("[DEBUG] Dashboard authState:", {
      isAuthenticated: authState.isAuthenticated,
      isLoading: authState.isLoading,
      isInitialized: authState.isInitialized,
      user: authState.user?.id,
      timestamp: new Date().toISOString()
    });
    
    // Only redirect if auth is fully initialized and user is not authenticated
    if (authState.isInitialized && !authState.isAuthenticated && !authState.isLoading) {
      console.log("[DEBUG] Dashboard redirecting to sign-in");
      router.push('/sign-in');
    }
    
    // Set checking state to false once we have determined auth state
    if (authState.isInitialized) {
      setIsCheckingAuth(false);
    }
  }, [authState.isAuthenticated, authState.isLoading, authState.isInitialized, router]);

  // Show loading state while checking authentication
  if (isCheckingAuth || authState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  // Don't render anything if not authenticated (will be redirected)
  if (!authState.isAuthenticated) {
    return null;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard!</p>
    </div>
  );
}
