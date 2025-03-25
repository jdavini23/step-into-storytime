import { jest } from '@jest/globals';
import '@testing-library/jest-dom';

// Mock the environment variables
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://your-project.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'your-anon-key';

// Mock window.fetch
global.fetch = jest.fn();

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return {
      get: jest.fn(),
    };
  },
}));
