import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { supabase, createBrowserSupabaseClient } from '../client';
import type {
  Session,
  User,
  AuthError,
  AuthResponse,
  AuthSession,
  AuthTokenResponse,
} from '@supabase/supabase-js';
import type {
  PostgrestError,
  PostgrestSingleResponse,
  PostgrestResponse,
  PostgrestQueryBuilder,
  GenericSchema,
} from '@supabase/postgrest-js';

interface Story {
  id: number;
  name: string;
}

interface Database {
  public: {
    Tables: {
      stories: {
        Row: Story;
        Insert: Story;
        Update: Story;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

// Helper type for mocked fetch
type FetchMock = jest.MockedFunction<typeof fetch>;

// Helper type for mocked database responses
type MockedQueryBuilder = {
  select: jest.Mock;
  eq: jest.Mock;
  single: jest.Mock;
  insert: jest.Mock;
  upsert: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  url: string;
  headers: Record<string, string>;
};

describe('Supabase Client', () => {
  // Define mock user and session at the top level for reuse
  const mockUser: User = {
    id: '123',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'test@example.com',
    app_metadata: {},
    user_metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const mockSession: Session = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: mockUser,
  };

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Reset localStorage before each test
    localStorage.clear();

    // Mock console methods to prevent noise during tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});

    // Reset global fetch mock with proper typing
    global.fetch = jest.fn(() =>
      Promise.resolve(new Response())
    ) as unknown as typeof fetch;
  });

  it('should initialize with correct environment variables', () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBeDefined();
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBeDefined();
  });

  it('should create a valid Supabase client instance', () => {
    expect(supabase).toBeDefined();
    expect(supabase.auth).toBeDefined();
    expect(typeof supabase.from).toBe('function');
  });

  it('should return the same instance when creating multiple clients', () => {
    const instance1 = createBrowserSupabaseClient();
    const instance2 = createBrowserSupabaseClient();
    expect(instance1).toBe(instance2);
  });

  describe('Authentication', () => {
    it('should handle authentication methods', async () => {
      const mockAuthResponse: AuthTokenResponse = {
        data: {
          user: mockUser,
          session: mockSession,
        },
        error: null,
      };

      jest
        .spyOn(supabase.auth, 'getSession')
        .mockResolvedValue(mockAuthResponse);

      const { data, error } = await supabase.auth.getSession();

      expect(error).toBeNull();
      expect(data.session).toEqual(mockSession);
    });

    it('should handle session refresh when close to expiring', async () => {
      const expiredSession = {
        ...mockSession,
        expires_at: Math.floor(Date.now() / 1000) + 240, // 4 minutes until expiry
      };

      const refreshedSession = {
        ...mockSession,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        access_token: 'new-access-token',
      };

      const mockExpiredAuthResponse: AuthTokenResponse = {
        data: {
          user: mockUser,
          session: expiredSession,
        },
        error: null,
      };

      const mockRefreshedAuthResponse: AuthTokenResponse = {
        data: {
          user: mockUser,
          session: refreshedSession,
        },
        error: null,
      };

      jest
        .spyOn(supabase.auth, 'getSession')
        .mockResolvedValue(mockExpiredAuthResponse);
      jest
        .spyOn(supabase.auth, 'refreshSession')
        .mockResolvedValue(mockRefreshedAuthResponse);

      // Mock fetch to return a successful response
      (global.fetch as FetchMock).mockImplementationOnce(() =>
        Promise.resolve(new Response(JSON.stringify({ data: null })))
      );

      // Trigger a fetch that should cause a refresh
      await supabase.from('stories').select().single();

      expect(supabase.auth.refreshSession).toHaveBeenCalled();
    });

    it('should continue with current session if refresh fails', async () => {
      const expiredSession = {
        ...mockSession,
        expires_at: Math.floor(Date.now() / 1000) + 240,
      };

      const mockExpiredAuthResponse: AuthTokenResponse = {
        data: {
          user: mockUser,
          session: expiredSession,
        },
        error: null,
      };

      jest
        .spyOn(supabase.auth, 'getSession')
        .mockResolvedValue(mockExpiredAuthResponse);

      // Create a real AuthError instance
      const mockAuthError = new Error('Refresh failed') as AuthError;
      mockAuthError.name = 'AuthApiError';
      mockAuthError.status = 400;
      mockAuthError.message = 'Refresh failed';

      const mockFailedAuthResponse: AuthTokenResponse = {
        data: {
          user: null,
          session: null,
        },
        error: mockAuthError,
      };

      jest
        .spyOn(supabase.auth, 'refreshSession')
        .mockResolvedValue(mockFailedAuthResponse);

      // Mock fetch to return an error response
      (global.fetch as FetchMock).mockImplementationOnce(() =>
        Promise.resolve(
          new Response(JSON.stringify({ error: 'Database error' }), {
            status: 400,
          })
        )
      );

      const { error } = await supabase.from('stories').select().single();

      expect(supabase.auth.refreshSession).toHaveBeenCalled();
      expect(error).toBeDefined();
    });
  });

  describe('Fetch Implementation', () => {
    it('should retry failed requests', async () => {
      const mockData = { id: 1, name: 'Test Story' };

      (global.fetch as FetchMock)
        .mockImplementationOnce(() =>
          Promise.reject(new Error('Network error'))
        )
        .mockImplementationOnce(() =>
          Promise.resolve(new Response(JSON.stringify({ data: mockData })))
        );

      const result = await supabase.from('stories').select().single();

      expect(global.fetch).toHaveBeenCalledTimes(2);
      expect(result.error).toBeNull();
    });

    it('should handle timeout correctly', async () => {
      jest.useFakeTimers();

      (global.fetch as FetchMock).mockImplementation(
        () =>
          new Promise((resolve) => {
            setTimeout(
              () => resolve(new Response(JSON.stringify({ data: null }))),
              20000
            ); // Longer than timeout
          })
      );

      const fetchPromise = supabase.from('stories').select().single();

      jest.advanceTimersByTime(16000); // Just past the 15s timeout

      const result = await fetchPromise;

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('AbortError');

      jest.useRealTimers();
    });

    it('should include authorization header when session exists', async () => {
      const testSession = {
        ...mockSession,
        access_token: 'test-token',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
      };

      const mockAuthResponse: AuthTokenResponse = {
        data: {
          user: mockUser,
          session: testSession,
        },
        error: null,
      };

      jest
        .spyOn(supabase.auth, 'getSession')
        .mockResolvedValue(mockAuthResponse);

      (global.fetch as FetchMock).mockImplementationOnce(() =>
        Promise.resolve(new Response(JSON.stringify({ data: null })))
      );

      await supabase.from('stories').select().single();

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });
  });

  describe('Database Operations', () => {
    it('should handle database queries', async () => {
      const mockData: Story = { id: 1, name: 'Test Story' };
      const mockResponse: PostgrestSingleResponse<Story> = {
        data: mockData,
        error: null,
        count: null,
        status: 200,
        statusText: 'OK',
      };

      const mockBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockResponse),
        insert: jest.fn().mockReturnThis(),
        upsert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        url: 'https://example.com',
        headers: {},
      } as unknown as PostgrestQueryBuilder<Database, Story>;

      jest.spyOn(supabase, 'from').mockReturnValue(mockBuilder);

      const { data, error } = await supabase
        .from('stories')
        .select()
        .eq('id', 1)
        .single();

      expect(error).toBeNull();
      expect(data).toEqual(mockData);
    });

    it('should handle errors gracefully', async () => {
      const mockError: PostgrestError = {
        message: 'Database error',
        details: 'Error details',
        hint: 'Error hint',
        code: 'ERROR',
        name: 'PostgrestError',
      };

      const mockResponse: PostgrestSingleResponse<Story> = {
        data: null,
        error: mockError,
        count: null,
        status: 400,
        statusText: 'Bad Request',
      };

      const mockBuilder = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockResponse),
        insert: jest.fn().mockReturnThis(),
        upsert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        url: 'https://example.com',
        headers: {},
      } as unknown as PostgrestQueryBuilder<Database, Story>;

      jest.spyOn(supabase, 'from').mockReturnValue(mockBuilder);

      const { data, error } = await supabase
        .from('stories')
        .select()
        .eq('id', 1)
        .single();

      expect(data).toBeNull();
      expect(error).toEqual(mockError);
    });
  });
});
