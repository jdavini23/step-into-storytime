'use client';

import { useState } from 'react';
import Link from 'next/link';
import { BookOpen, ArrowLeft, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resetLinkSent, setResetLinkSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Email is required');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // In a real app, this would call an API endpoint
      // For demo purposes, we'll simulate success after a delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setResetLinkSent(true);
    } catch (error) {
      setError('Failed to send reset link. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-violet-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center justify-center mb-4"
          >
            <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center mr-3 shadow-md">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">
              Step Into Storytime
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Reset your password
          </h1>
          <p className="text-slate-600">
            We'll send you a link to reset your password
          </p>
        </div>

        {/* Forgot password form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
          {resetLinkSent ? (
            <div className="text-center py-6">
              <div className="bg-violet-100 text-violet-800 p-4 rounded-lg mb-4">
                <Mail className="h-12 w-12 mx-auto mb-2" />
                <h3 className="text-lg font-semibold mb-1">Check your email</h3>
                <p>We've sent a password reset link to {email}</p>
              </div>
              <p className="text-slate-600 mb-4">
                Click the link in the email to reset your password. If you don't
                see it, check your spam folder.
              </p>
              <Button
                variant="outline"
                onClick={() => setResetLinkSent(false)}
                className="w-full"
              >
                Try a different email
              </Button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-700">
                  Email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className="h-12"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  disabled={isLoading}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  'Send reset link'
                )}
              </Button>
            </form>
          )}
        </div>

        {/* Back to sign in */}
        <div className="text-center">
          <Link
            href="/sign-in"
            className="inline-flex items-center text-violet-600 hover:text-violet-700 font-medium"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
