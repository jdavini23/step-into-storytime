'use client';

import React, { useEffect, useRef } from 'react';
import type { ReactElement } from 'react';

// Hook to manage focus trap within a container
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive) return;

    const container = containerRef.current;
    if (!container) return;

    // Get all focusable elements
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0] as HTMLElement;
    const lastFocusable = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    // Handle tab key press
    function handleTabKey(e: KeyboardEvent) {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          lastFocusable.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          firstFocusable.focus();
          e.preventDefault();
        }
      }
    }

    // Focus first element when trap is activated
    firstFocusable?.focus();

    // Add event listener
    document.addEventListener('keydown', handleTabKey);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return containerRef;
}

// Hook to announce messages to screen readers
export function useAnnounce() {
  const announceRef = useRef<HTMLDivElement>(null);

  const announce = (
    message: string,
    priority: 'polite' | 'assertive' = 'polite'
  ) => {
    if (announceRef.current) {
      announceRef.current.setAttribute('aria-live', priority);
      announceRef.current.textContent = message;
    }
  };

  const AnnouncerElement = (): ReactElement => {
    return (
      <div
        ref={announceRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />
    );
  };

  return {
    announce,
    AnnouncerElement,
  };
}

// Skip link component for keyboard navigation
export function SkipLink({ contentId }: { contentId: string }): ReactElement {
  return (
    <a
      href={`#${contentId}`}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-600"
    >
      Skip to main content
    </a>
  );
}

// Helper to generate proper ARIA labels
export function generateAriaLabel(text: string, context?: string): string {
  return context ? `${text} ${context}` : text;
}

// Helper to manage heading levels
export class HeadingLevel {
  private level: number;

  constructor(initialLevel: number = 1) {
    this.level = Math.min(Math.max(initialLevel, 1), 6);
  }

  current(): number {
    return this.level;
  }

  next(): number {
    this.level = Math.min(this.level + 1, 6);
    return this.level;
  }

  prev(): number {
    this.level = Math.max(this.level - 1, 1);
    return this.level;
  }

  reset(level: number = 1): number {
    this.level = Math.min(Math.max(level, 1), 6);
    return this.level;
  }
}
