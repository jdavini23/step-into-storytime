import Link from 'next/link';
import { BookOpen } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-background border-t">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <Link href="/" className="flex items-center">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="ml-2 text-xl font-bold">Step Into Storytime</span>
          </Link>
          <nav className="mt-8 space-y-4 text-sm text-muted-foreground">
            <div className="flex space-x-4">
              <Link href="/about" className="hover:text-foreground">
                About
              </Link>
              <Link href="/privacy" className="hover:text-foreground">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-foreground">
                Terms
              </Link>
              <Link href="/contact" className="hover:text-foreground">
                Contact
              </Link>
            </div>
          </nav>
          <p className="mt-8 text-sm text-muted-foreground">
            © {new Date().getFullYear()} Step Into Storytime. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
