'use client';

import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { BookOpen, Menu, X, ArrowUp } from 'lucide-react';
import { motion, useScroll, useSpring, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/contexts/auth-context';
import { DesktopNav } from './desktop-nav';
import { LoadingSpinner } from './loading-spinner';

// Lazy load the mobile menu
const MobileMenu = lazy(() => import('./mobile-menu'));

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default function Navbar() {
  const { state: authState, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Use Intersection Observer for scroll detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setScrolled(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '-50px' }
    );

    const target = document.createElement('div');
    target.style.height = '1px';
    target.style.width = '1px';
    target.style.position = 'absolute';
    target.style.top = '0';
    document.body.appendChild(target);
    observer.observe(target);

    return () => {
      observer.disconnect();
      document.body.removeChild(target);
    };
  }, []);

  // Show back to top button after scrolling 500px
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Memoize the scroll handler
  const handleScroll = useCallback(() => {
    const offset = window.scrollY;
    setScrolled(offset > 50);

    // Only determine active section on homepage
    if (pathname === '/') {
      const sections = [
        'home',
        'features',
        'how-it-works',
        'stories',
        'pricing',
      ];
      for (const section of sections.reverse()) {
        const element = document.getElementById(section);
        if (element && window.scrollY >= element.offsetTop - 100) {
          setActiveSection(section);
          break;
        }
      }
    }
  }, [pathname]);

  // Handle scroll events for navbar appearance with debounce
  useEffect(() => {
    const debouncedHandleScroll = debounce(handleScroll, 50);
    window.addEventListener('scroll', debouncedHandleScroll, { passive: true });

    // Call once on mount to set initial state
    handleScroll();

    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
    };
  }, [handleScroll]);

  const handleNavigation = async (path: string) => {
    try {
      setIsNavigating(true);
      await router.push(path);
    } finally {
      setIsNavigating(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsNavigating(true);
      await logout();
      await router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsNavigating(false);
    }
  };

  const handleMobileMenuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsMenuOpen(false);
    }
    // Trap focus within the menu
    if (e.key === 'Tab') {
      const focusableElements = e.currentTarget.querySelectorAll(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  return (
    <>
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-violet-600 text-white px-4 py-2 rounded-md z-50"
      >
        Skip to main content
      </a>

      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-600 via-violet-500 to-indigo-600 origin-left z-50 shadow-[0_0_8px_rgba(124,58,237,0.5)]"
        style={{ scaleX }}
      />

      {/* Navigation Progress Indicator */}
      {isNavigating && (
        <div
          className="fixed top-0 left-0 right-0 z-50 bg-violet-600 h-1"
          role="progressbar"
          aria-valuetext="Loading page"
          aria-busy="true"
        />
      )}

      <nav
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-md shadow-sm py-3'
            : 'bg-transparent py-5'
        }`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link
              href="/"
              className="flex items-center group"
              aria-label="Step Into Storytime - Home"
              onClick={(e) => {
                if (pathname === '/') {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            >
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 flex items-center justify-center mr-3 shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:rotate-3 group-active:scale-95">
                <BookOpen
                  className="h-5 w-5 text-white transition-transform group-hover:scale-110"
                  aria-hidden="true"
                />
              </div>
              <span
                className={`text-base sm:text-lg font-bold transition-all duration-300 ${
                  scrolled ? 'text-slate-900' : 'text-slate-800'
                } group-hover:text-violet-600`}
              >
                Step Into Storytime
              </span>
            </Link>

            {/* Desktop Navigation */}
            <DesktopNav
              activeSection={activeSection}
              scrolled={scrolled}
              isAuthenticated={authState.isAuthenticated}
              isNavigating={isNavigating}
              onLogin={() => handleNavigation('/sign-in')}
              onLogout={handleLogout}
              onDashboard={() => handleNavigation('/dashboard')}
              onSignUp={() => handleNavigation('/sign-up')}
            />

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                type="button"
                className={`p-2 rounded-lg transition-all duration-300 ${
                  scrolled
                    ? 'text-slate-700 hover:bg-slate-100'
                    : 'text-slate-700 hover:bg-white/20'
                } focus:ring-2 focus:ring-violet-500 focus:outline-none active:scale-95`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
              >
                {isMenuOpen ? (
                  <X
                    className="h-6 w-6 transition-transform"
                    aria-hidden="true"
                  />
                ) : (
                  <Menu
                    className="h-6 w-6 transition-transform"
                    aria-hidden="true"
                  />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu with Suspense */}
        <Suspense fallback={<LoadingSpinner />}>
          {isMenuOpen && (
            <MobileMenu
              isOpen={isMenuOpen}
              activeSection={activeSection}
              isAuthenticated={authState.isAuthenticated}
              isNavigating={isNavigating}
              onMenuItemClick={() => setIsMenuOpen(false)}
              onLogin={() => {
                setIsMenuOpen(false);
                handleNavigation('/sign-in');
              }}
              onLogout={() => {
                setIsMenuOpen(false);
                handleLogout();
              }}
              onDashboard={() => {
                setIsMenuOpen(false);
                handleNavigation('/dashboard');
              }}
              onSignUp={() => {
                setIsMenuOpen(false);
                handleNavigation('/sign-up');
              }}
              onKeyDown={handleMobileMenuKeyDown}
            />
          )}
        </Suspense>
      </nav>

      {/* Back to Top Button */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 right-6 bg-violet-600 text-white p-3 rounded-full shadow-lg hover:bg-violet-700 transition-colors z-40"
            aria-label="Back to top"
          >
            <ArrowUp className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
