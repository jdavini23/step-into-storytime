'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-violet-50 px-4 text-center">
      <h1 className="text-7xl font-bold text-violet-600 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-slate-800 mb-2">
        Oops! Page not found
      </h2>
      <p className="text-slate-600 max-w-md mb-8">
        The page you are looking for might have been removed or is temporarily
        unavailable.
      </p>

      <Button
        asChild
        className="px-6 py-5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium"
      >
        <Link href="/">Return Home</Link>
      </Button>
    </div>
  );
}
