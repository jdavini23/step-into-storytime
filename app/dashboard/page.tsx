'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

export default function DashboardPage() {
  const router = useRouter();
  const { state: authState } = useAuth();

  useEffect(() => {
    if (!authState.isAuthenticated && !authState.isLoading) {
      router.push('/sign-in');
    }
  }, [authState.isAuthenticated, authState.isLoading, router]);


  if (!authState.isAuthenticated) {
    return null; // Redirected in useEffect
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard!</p>
    </div>
  );
}
