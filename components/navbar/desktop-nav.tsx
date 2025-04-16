import React, { useState, useRef, useEffect } from 'react';
import { NavLink } from './nav-link';
import { AuthButtons } from './auth-buttons';
import { motion, AnimatePresence } from 'framer-motion';

interface DesktopNavProps {
  activeSection: string;
  scrolled: boolean;
  isAuthenticated: boolean;
  isNavigating: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onDashboard: () => void;
  onSignUp: () => void;
  userName?: string;
}

export function DesktopNav({
  activeSection,
  scrolled,
  isAuthenticated,
  isNavigating,
  onLogin,
  onLogout,
  onDashboard,
  onSignUp,
  userName,
}: DesktopNavProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const navItems = [
    { href: '/#home', label: 'Home' },
    { href: '/#features', label: 'Features' },
    { href: '/#how-it-works', label: 'How It Works' },
    { href: '/#stories', label: 'Stories' },
    { href: '/#pricing', label: 'Pricing' },
  ];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!navRef.current?.contains(document.activeElement)) return;

      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          setFocusedIndex((prev) => (prev + 1) % navItems.length);
          break;
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          setFocusedIndex(
            (prev) => (prev - 1 + navItems.length) % navItems.length
          );
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navItems.length]);

  useEffect(() => {
    if (focusedIndex >= 0) {
      const links = navRef.current?.querySelectorAll('a');
      links?.[focusedIndex]?.focus();
    }
  }, [focusedIndex]);

  return (
    <div className="hidden md:flex items-center space-x-1" ref={navRef}>
      <nav
        className="flex items-center space-x-1"
        role="navigation"
        aria-label="Desktop navigation"
      >
        {navItems.map(({ href, label }, index) => (
          <NavLink
            key={href}
            href={href}
            active={activeSection === href.replace('/#', '')}
            scrolled={scrolled}
            onFocus={() => setFocusedIndex(index)}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="ml-6 flex items-center space-x-3">
        <AuthButtons
          isAuthenticated={isAuthenticated}
          isNavigating={isNavigating}
          scrolled={scrolled}
          onLogin={onLogin}
          onLogout={onLogout}
          onDashboard={onDashboard}
          onSignUp={onSignUp}
        />
        {userName && (
          <span className="ml-auto text-base font-medium text-violet-700 dark:text-violet-300 whitespace-nowrap">
            Hi, {userName}!
          </span>
        )}
      </div>
    </div>
  );
}
