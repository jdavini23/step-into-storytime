'use client';

import { useEffect } from 'react';

export function PathnameInitializer() {
  useEffect(() => {
    if (typeof window !== 'undefined' && !process.env.VAR_ORIGINAL_PATHNAME) {
      process.env.VAR_ORIGINAL_PATHNAME = window.location.pathname;
    }
  }, []);

  return null;
}