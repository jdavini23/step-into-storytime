import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface MenuLinkProps {
  href: string;
  active: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}

export function MenuLink({ href, active, onClick, children }: MenuLinkProps) {
  return (
    <motion.div
      variants={{
        open: {
          opacity: 1,
          x: 0,
          transition: {
            type: 'spring',
            stiffness: 300,
            damping: 24,
          },
        },
        closed: {
          opacity: 0,
          x: -20,
          transition: {
            duration: 0.2,
          },
        },
      }}
    >
      <Link
        href={href}
        className={`block py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
          active
            ? 'bg-violet-50 text-violet-600'
            : 'text-slate-600 hover:bg-slate-50 hover:text-violet-600'
        } focus:outline-none focus:ring-2 focus:ring-violet-500 active:scale-98`}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick?.();
          }
        }}
        role="menuitem"
        aria-current={active ? 'page' : undefined}
        tabIndex={0}
      >
        <div className="flex items-center">
          <span className="flex-1">{children}</span>
          {active && (
            <div
              className="h-2 w-2 rounded-full bg-violet-600"
              aria-hidden="true"
            />
          )}
        </div>
      </Link>
    </motion.div>
  );
}
