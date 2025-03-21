'use client';

import React from 'react';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorInfo: null,
  });

  useEffect(() => {
    // Error handler for runtime errors
    const errorHandler = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      setErrorState({
        hasError: true,
        error: event.error,
        errorInfo: null,
      });
      // Prevent the error from being reported to the console
      event.preventDefault();
    };

    // Unhandled promise rejection handler
    const rejectionHandler = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      setErrorState({
        hasError: true,
        error:
          event.reason instanceof Error
            ? event.reason
            : new Error(String(event.reason)),
        errorInfo: null,
      });
      // Prevent the rejection from being reported to the console
      event.preventDefault();
    };

    // Add event listeners
    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);

    // Clean up event listeners
    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, []);

  // Handle componentDidCatch logic
  const componentDidCatch = (error: Error, errorInfo: React.ErrorInfo) => {
    console.error('Caught error in ErrorBoundary:', error, errorInfo);
    setErrorState({
      hasError: true,
      error: error,
      errorInfo: errorInfo,
    });

    // Log to error reporting service (example)
    // logErrorToService(error, errorInfo);
  };

  // Reset error state - for retry functionality
  const resetErrorBoundary = () => {
    setErrorState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  // If there's an error, render error UI
  if (errorState.hasError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-violet-50">
        <Card className="w-full max-w-md shadow-lg border-red-200">
          <CardHeader className="bg-red-50 border-b border-red-100">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-red-100">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <CardTitle className="text-red-700">
                  Something went wrong
                </CardTitle>
                <CardDescription className="text-red-600">
                  We apologize for the inconvenience
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <p className="text-slate-700">
                An unexpected error occurred. Our team has been notified, but
                you can try these options:
              </p>

              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 text-sm text-slate-800 font-mono overflow-auto max-h-28">
                {errorState.error?.message || 'Unknown error'}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row gap-2 pt-2">
            <Button
              onClick={resetErrorBoundary}
              className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" /> Try Again
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/">
                <Home className="h-4 w-4 mr-2" /> Return Home
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Extend the Component to handle errors in children
  return (
    <ErrorBoundaryComponent componentDidCatch={componentDidCatch}>
      {children}
    </ErrorBoundaryComponent>
  );
}

// Internal component to handle componentDidCatch lifecycle method
class ErrorBoundaryComponent extends React.Component<{
  children: React.ReactNode;
  componentDidCatch: (error: Error, errorInfo: React.ErrorInfo) => void;
}> {
  static getDerivedStateFromError(error: Error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.componentDidCatch(error, errorInfo);
  }

  render() {
    return this.props.children;
  }
}
