'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function ConfirmEmailPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      router.push('/sign-in');
    }
  }, [countdown, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-slate-50 to-violet-50 px-4">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <div className="flex flex-col items-center text-center">
          <div className="p-3 rounded-full bg-violet-100 mb-4">
            <Mail className="h-10 w-10 text-violet-600" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Check your email
          </h1>

          <p className="text-slate-600 mb-6">
            We've sent a confirmation link to your email address. Please check
            your inbox and click the link to activate your account.
          </p>

          <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-start mb-6 w-full">
            <CheckCircle2 className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Account created successfully!</p>
              <p className="text-sm mt-1">
                You'll be redirected to sign in after confirming your email.
              </p>
            </div>
          </div>

          <div className="w-full space-y-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push('/sign-in')}
            >
              Go to Sign In ({countdown}s)
            </Button>

            <div className="text-sm text-slate-500">
              <p>
                Didn't receive an email? Check your spam folder or
                <Link
                  href="/sign-up"
                  className="text-violet-600 hover:text-violet-700 ml-1"
                >
                  try again with a different email
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
