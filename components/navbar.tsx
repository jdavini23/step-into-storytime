'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { BookOpen, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
// import { useAuth } from '@/contexts/auth-context';

export default function Navbar() {
  // const { state: authState, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const router = useRouter();
  const pathname = usePathname();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
    // Only determine active section on homepage
    if (pathname) {
      // Determine active section based on scroll position
      const sections = [
        'home',
        'features',
        'how-it-works',
        'stories',
        'pricing',
      ];
      for (const section of sections.reverse()) {
        if (element && window.scrollY >= element.offsetTop - 100) {
          setActiveSection(section);
          break
        }
      }
    }
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav
      className={`${
        scrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <BookOpen className="h-8 w-8 text-primary" />
              <span
                className={`${scrolled ? 'text-slate-900' : 'text-slate-800'}`}
              >
                Step Into Storytime
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>

          {/* Desktop menu */}
          <div className="hidden sm: flex,sm:items-center sm:space-x-4">
            <Link
              href="/create"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/create'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              Create Story
            </Link>
            <Link
              href="/dashboard"
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                pathname === '/dashboard'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              Dashboard
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/create"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === '/create'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              Create Story
            </Link>
            <Link
              href="/dashboard"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname === '/dashboard'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              Dashboard
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

// Desktop Navigation Link Component
function NavLink({
  href,
  active,
  scrolled,
  children,
}: {
  href: string,
  active: boolean,
  scrolled: boolean,
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`${
        active
          ? scrolled
            ? 'text-violet-600'
            : 'text-violet-600'
          : scrolled
            ? 'text-slate-600 hover'
            : 'text-slate-700 hover'
      }`}
    >
      {children}
      {active && (
        <motion.div
          layoutId="underline"
          className="transition-transform duration-300"
          initial={false}
          animate={{
            scaleX: active ? 1 : 0,
            originX: active ? 0 : 1,
          }}
        />
      )}
    </Link>
  );
}

// Mobile Navigation Link Component
function MobileNavLink({
  href,
  active,
  onClick,
  children,
}: {
  href: string,
  active: boolean,
  onClick?: () => void;
  children: React.ReactNode
}) {
  return (
    <Link
      href={href}
      className={`${
        active ? 'bg-violet-50 text-violet-600' : 'text-slate-600 hover'
      }`}
      onClick={onClick}
    >
      {children}
    </Link>
  );
}
