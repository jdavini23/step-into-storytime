import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MenuLink } from './menu-link';
import { AuthButtons } from './auth-buttons';

interface MobileMenuProps {
  isOpen: boolean;
  activeSection: string;
  isAuthenticated: boolean;
  isNavigating: boolean;
  onMenuItemClick: () => void;
  onLogin: () => void;
  onLogout: () => void;
  onDashboard: () => void;
  onSignUp: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const MobileMenu = ({
  isOpen,
  activeSection,
  isAuthenticated,
  isNavigating,
  onMenuItemClick,
  onLogin,
  onLogout,
  onDashboard,
  onSignUp,
  onKeyDown,
}: MobileMenuProps) => {
  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <motion.div
          key="mobile-menu"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{
            duration: 0.2,
            ease: 'easeOut',
          }}
          className="md:hidden bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-lg"
          id="mobile-menu"
          role="menu"
          aria-label="Mobile navigation menu"
          onKeyDown={onKeyDown}
        >
          <motion.div
            className="container mx-auto px-4 py-5 space-y-1"
            initial="closed"
            animate="open"
            exit="closed"
            variants={{
              open: {
                transition: {
                  staggerChildren: 0.05,
                  delayChildren: 0.1,
                },
              },
              closed: {
                transition: {
                  staggerChildren: 0.05,
                  staggerDirection: -1,
                },
              },
            }}
          >
            <MenuLink
              href="/#home"
              active={activeSection === 'home'}
              onClick={onMenuItemClick}
            >
              Home
            </MenuLink>
            <MenuLink
              href="/#features"
              active={activeSection === 'features'}
              onClick={onMenuItemClick}
            >
              Features
            </MenuLink>
            <MenuLink
              href="/#how-it-works"
              active={activeSection === 'how-it-works'}
              onClick={onMenuItemClick}
            >
              How It Works
            </MenuLink>
            <MenuLink
              href="/#stories"
              active={activeSection === 'stories'}
              onClick={onMenuItemClick}
            >
              Stories
            </MenuLink>
            <MenuLink
              href="/#pricing"
              active={activeSection === 'pricing'}
              onClick={onMenuItemClick}
            >
              Pricing
            </MenuLink>

            <motion.div
              className="pt-4 flex flex-col space-y-3"
              variants={{
                open: {
                  opacity: 1,
                  y: 0,
                  transition: { delay: 0.3 },
                },
                closed: {
                  opacity: 0,
                  y: 20,
                },
              }}
            >
              <AuthButtons
                isAuthenticated={isAuthenticated}
                isNavigating={isNavigating}
                scrolled={true}
                onLogin={onLogin}
                onLogout={onLogout}
                onDashboard={onDashboard}
                onSignUp={onSignUp}
                isMobile={true}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
