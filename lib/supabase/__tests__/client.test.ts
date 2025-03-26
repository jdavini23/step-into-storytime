import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { supabase } from '../client';
import type { Session, User } from '@supabase/supabase-js';
import type { PostgrestError } from '@supabase/postgrest-js';

interface Story {
  id: number;
  name: string;
}

describe('Supabase Client', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
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

  it('should handle authentication methods', async () => {
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
      token_type: 'bearer',
      user: mockUser,
    };

    jest.spyOn(supabase.auth, 'getSession').mockResolvedValue({
      data: { session: mockSession },
      error: null,
    });

    const { data, error } = await supabase.auth.getSession();

    expect(error).toBeNull();
    expect(data.session).toEqual(mockSession);
  });

  it('should handle database queries', async () => {
    const mockData: Story = { id: 1, name: 'Test Story' };
    const mockResponse = {
      data: mockData,
      error: null,
    };

    const mockBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue(mockResponse),
    };

    jest.spyOn(supabase, 'from').mockReturnValue(mockBuilder as any);

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

    const mockResponse = {
      data: null,
      error: mockError,
    };

    const mockBuilder = {
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue(mockResponse),
    };

    jest.spyOn(supabase, 'from').mockReturnValue(mockBuilder as any);

    const { data, error } = await supabase
      .from('stories')
      .select()
      .eq('id', 1)
      .single();

    expect(data).toBeNull();
    expect(error).toEqual(mockError);
  });
});
