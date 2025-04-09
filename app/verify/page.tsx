'use client';

import Link from 'next/link';
import { MailCheck } from 'lucide-react';

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-violet-50 flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <MailCheck className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          Check your email
        </h1>
        <p className="text-slate-600 mb-6">
          We've sent a verification link to the email address you provided.
          Please click the link in the email to activate your account.
        </p>
        <p className="text-sm text-slate-500 mb-6">
          If you don't see the email within a few minutes, please check your
          spam folder.
        </p>
        <Link
          href="/sign-in"
          className="text-violet-600 hover:text-violet-700 font-medium"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
