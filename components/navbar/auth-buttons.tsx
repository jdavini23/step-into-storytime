import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { LoadingSpinner } from './loading-spinner';

interface AuthButtonsProps {
  isAuthenticated: boolean;
  isNavigating: boolean;
  scrolled: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onDashboard: () => void;
  onSignUp: () => void;
  isMobile?: boolean;
}

const AuthButtonsComponent: React.FC<AuthButtonsProps> = ({
  isAuthenticated,
  isNavigating,
  scrolled,
  onLogin,
  onLogout,
  onDashboard,
  onSignUp,
  isMobile = false,
}) => {
  const buttonBaseClasses = `px-4 py-2 rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500 active:scale-95 ${
    isMobile ? 'w-full justify-center' : ''
  }`;

  const primaryButtonClasses = `${buttonBaseClasses} bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:from-violet-700 hover:to-indigo-700 shadow-md hover:shadow-lg`;
  const secondaryButtonClasses = `${buttonBaseClasses} ${
    scrolled
      ? 'text-slate-700 hover:bg-slate-100'
      : 'text-slate-700 hover:bg-white/20'
  }`;

  if (isNavigating) {
    return (
      <div className="flex items-center space-x-3">
        <div className="w-24 h-10 bg-slate-200 rounded-lg animate-pulse" />
        <div className="w-24 h-10 bg-slate-200 rounded-lg animate-pulse" />
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div
        className={`flex ${
          isMobile ? 'flex-col space-y-3' : 'items-center space-x-3'
        }`}
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={primaryButtonClasses}
          onClick={onDashboard}
        >
          Dashboard
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={secondaryButtonClasses}
          onClick={onLogout}
        >
          Sign Out
        </motion.button>
      </div>
    );
  }

  return (
    <div
      className={`flex ${
        isMobile ? 'flex-col space-y-3' : 'items-center space-x-3'
      }`}
    >
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={secondaryButtonClasses}
        onClick={onLogin}
      >
        Sign In
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={primaryButtonClasses}
        onClick={onSignUp}
      >
        Sign Up
      </motion.button>
    </div>
  );
};

export const AuthButtons = memo(AuthButtonsComponent);
