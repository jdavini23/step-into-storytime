\"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

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
      timestamp: new Date().toISOString(),
    });

    // Wait for auth to be fully initialized before making any decisions
    // Only redirect if auth is fully initialized, not loading, and user is not authenticated
    if (
      authState.isInitialized &&
      !authState.isLoading &&
      !authState.isAuthenticated
    ) {
      console.log("[DEBUG] Dashboard redirecting to sign-in");
      router.push("/sign-in");
    }

    // Set checking state to false once we have determined auth state
    if (authState.isInitialized && !authState.isLoading) {
      setIsCheckingAuth(false);
    }
  }, [
    authState.isAuthenticated,
    authState.isLoading,
    authState.isInitialized,
    authState.user,
    router,
  ]);

  // Show loading state while checking authentication or while auth is loading
  if (isCheckingAuth || authState.isLoading || !authState.isInitialized) {
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p className="mb-4">Welcome to the dashboard, {authState.user?.email}!</p>
      <p>User ID: {authState.user?.id}</p>
    </div>
  );
}
