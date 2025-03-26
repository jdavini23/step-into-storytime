import Link from 'next/link';
import { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for could not be found.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="text-xl text-foreground">Oops! Page not found</p>
        <p className="text-muted-foreground">
          The page you are looking for might have been removed or is temporarily
          unavailable.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
        >
          Return Home
        </Link>
      </div>
    </div>
  );
}
