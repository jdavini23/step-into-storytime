import React from 'react';
import { NavLink } from './nav-link';
import { AuthButtons } from './auth-buttons';

interface DesktopNavProps {
  activeSection: string;
  scrolled: boolean;
  isAuthenticated: boolean;
  isNavigating: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onDashboard: () => void;
  onSignUp: () => void;
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
}: DesktopNavProps) {
  return (
    <>
      <div
        className="hidden md:flex items-center space-x-1"
        role="menubar"
        aria-label="Desktop navigation menu"
      >
        <NavLink
          href="/#home"
          active={activeSection === 'home'}
          scrolled={scrolled}
          aria-current={activeSection === 'home' ? 'page' : undefined}
        >
          Home
        </NavLink>
        <NavLink
          href="/#features"
          active={activeSection === 'features'}
          scrolled={scrolled}
          aria-current={activeSection === 'features' ? 'page' : undefined}
        >
          Features
        </NavLink>
        <NavLink
          href="/#how-it-works"
          active={activeSection === 'how-it-works'}
          scrolled={scrolled}
          aria-current={activeSection === 'how-it-works' ? 'page' : undefined}
        >
          How It Works
        </NavLink>
        <NavLink
          href="/#stories"
          active={activeSection === 'stories'}
          scrolled={scrolled}
          aria-current={activeSection === 'stories' ? 'page' : undefined}
        >
          Stories
        </NavLink>
        <NavLink
          href="/#pricing"
          active={activeSection === 'pricing'}
          scrolled={scrolled}
          aria-current={activeSection === 'pricing' ? 'page' : undefined}
        >
          Pricing
        </NavLink>
      </div>

      <div
        className="hidden md:flex items-center space-x-3"
        role="navigation"
        aria-label="User actions"
      >
        <AuthButtons
          isAuthenticated={isAuthenticated}
          isNavigating={isNavigating}
          scrolled={scrolled}
          onLogin={onLogin}
          onLogout={onLogout}
          onDashboard={onDashboard}
          onSignUp={onSignUp}
        />
      </div>
    </>
  );
}
