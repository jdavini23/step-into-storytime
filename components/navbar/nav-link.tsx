import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface NavLinkProps {
  href: string;
  active: boolean;
  scrolled: boolean;
  children: React.ReactNode;
  onFocus?: () => void;
  'aria-current'?: 'page' | 'step' | 'location' | 'date' | 'time' | boolean;
}

export function NavLink({
  href,
  active,
  scrolled,
  children,
  onFocus,
  'aria-current': ariaCurrent,
}: NavLinkProps) {
  return (
    <Link
      href={href}
      className={`relative px-4 py-2 rounded-lg font-medium transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-violet-500 ${
        active
          ? scrolled
            ? 'text-violet-600 font-extrabold bg-violet-100 dark:bg-violet-900/60 shadow-sm'
            : 'text-violet-600 font-extrabold bg-violet-50 dark:bg-violet-900/40 shadow-sm'
          : scrolled
          ? 'text-slate-600 hover:text-violet-600'
          : 'text-slate-700 hover:text-violet-600'
      }`}
      role="menuitem"
      aria-current={ariaCurrent}
      onFocus={onFocus}
    >
      {children}
      <div
        className={`absolute bottom-0 left-0 right-0 h-1 mx-4 rounded-full transition-transform duration-200 origin-left scale-x-0 bg-violet-200 group-hover:scale-x-100 ${
          active ? 'hidden' : ''
        }`}
        aria-hidden="true"
      />
      {active && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute bottom-0 left-0 right-0 h-1 mx-4 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-full"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          initial={false}
          aria-hidden="true"
        />
      )}
    </Link>
  );
}
