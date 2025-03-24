import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Mock data for development
const mockStories = [
  {
    id: 'mock-story-1',
    title: 'The Adventure of the Brave Knight',
    content: '# The Adventure of the Brave Knight\n\nOnce upon a time, there was a brave knight who lived in a castle. The knight was known for their courage and kindness.\n\nOne day, a dragon appeared near the village. The villagers were scared and asked the knight for help.\n\n"I will help you," said the knight. "I will talk to the dragon and find out why it came to our village."\n\nThe knight went to the dragon\'s cave and discovered that the dragon was just looking for a friend. They became friends, and the dragon helped protect the village from then on.\n\nThe end.',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    user_id: 'mock-user-1',
    metadata: {
      theme: 'friendship',
      setting: 'medieval castle',
      targetAge: 7,
      wordCount: 120,
      readingTime: 2,
      difficulty: 'easy',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  },
  {
    id: 'mock-story-2',
    title: 'The Curious Explorer',
    content: '# The Curious Explorer\n\nIn a small town by the sea lived a curious child named Alex. Alex loved to explore and discover new things.\n\nOne sunny morning, Alex found an old map in the attic. The map showed a path to a hidden treasure on the nearby island.\n\nExcited by the discovery, Alex gathered some supplies and set off on an adventure. Along the way, Alex met friendly animals and overcame challenges.\n\nWhen Alex finally reached the spot marked on the map, there was a small chest. Inside was not gold or jewels, but a collection of beautiful seashells and a note that read: "The real treasure is the journey and the memories you make."\n\nAlex returned home with the seashells and wonderful stories to share with everyone.\n\nThe end.',
    created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    updated_at: new Date(Date.now() - 86400000).toISOString(),
    user_id: 'mock-user-1',
    metadata: {
      theme: 'discovery',
      setting: 'coastal town',
      targetAge: 8,
      wordCount: 150,
      readingTime: 3,
      difficulty: 'medium',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
    }
  }
];

const mockUser = {
  id: 'mock-user-1',
  email: 'user@example.com',
  user_metadata: {
    full_name: 'Test User',
    avatar_url: 'https://via.placeholder.com/150',
  },
  app_metadata: {
    provider: 'email',
  },
  created_at: new Date().toISOString(),
};

// Create a mock Supabase client for development
export const createMockSupabaseClient = (): SupabaseClient<Database> => {
  return {
    auth: {
      getSession: () => Promise.resolve({ 
        data: { 
          session: {
            user: mockUser,
            access_token: 'mock-token',
            refresh_token: 'mock-refresh-token',
            expires_at: Date.now() + 3600000,
          } 
        }, 
        error: null 
      }),
      getUser: () => Promise.resolve({ data: { user: mockUser }, error: null }),
      onAuthStateChange: (callback: (arg0: string, arg1: { session: { user: { id: string; email: string; user_metadata: { full_name: string; avatar_url: string; }; app_metadata: { provider: string; }; created_at: string; }; access_token: string; refresh_token: string; expires_at: number; }; }) => void) => {
        // Simulate an auth state change event
        setTimeout(() => {
          callback('SIGNED_IN', { 
            session: {
              user: mockUser,
              access_token: 'mock-token',
              refresh_token: 'mock-refresh-token',
              expires_at: Date.now() + 3600000,
            }
          });
        }, 100);
        
        return { 
          data: { 
            subscription: { 
              unsubscribe: () => {} 
            } 
          } 
        };
      },
      signInWithPassword: () => Promise.resolve({ 
        data: { 
          user: mockUser,
          session: {
            access_token: 'mock-token',
            refresh_token: 'mock-refresh-token',
            expires_at: Date.now() + 3600000,
          }
        }, 
        error: null 
      }),
      signInWithOAuth: () => Promise.resolve({ data: { provider: 'google', url: '#' }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
    },
    from: (table: string) => {
      // Handle different tables
      if (table === 'stories') {
        return {
          select: (columns = '*') => ({
            eq: (column: keyof typeof mockStories[0], value: any) => ({
              single: () => {
                const story = mockStories.find(s => s[column] === value);
                return Promise.resolve({ 
                  data: story || null, 
                  error: story ? null : new Error('Story not found') 
                });
              },
              order: () => ({
                limit: (limit: number | undefined) => Promise.resolve({ 
                  data: mockStories.slice(0, limit), 
                  error: null 
                }),
              }),
            }),
            order: () => ({
              limit: (limit: number | undefined) => Promise.resolve({ 
                data: mockStories.slice(0, limit), 
                error: null 
              }),
            }),
          }),
          insert: (data: any) => {
            const newStory = {
              id: `mock-story-${Date.now()}`,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              user_id: mockUser.id,
              ...data,
            };
            mockStories.push(newStory);
            return Promise.resolve({ data: newStory, error: null });
          },
          update: (data: { id: any; title?: string; content?: string; created_at?: string; updated_at?: string; user_id?: string; metadata?: { theme: string; setting: string; targetAge: number; wordCount: number; readingTime: number; difficulty: string; createdAt: string; updatedAt: string; }; }) => {
            const index = mockStories.findIndex(s => s.id === data.id);
            if (index >= 0) {
              mockStories[index] = {
                ...mockStories[index],
                ...data,
                updated_at: new Date().toISOString(),
              };
              return Promise.resolve({ data: mockStories[index], error: null });
            }
            return Promise.resolve({ data: null, error: new Error('Story not found') });
          },
        };
      }
      
      // Default behavior for other tables
      return {
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: null }),
          }),
        }),
        insert: () => Promise.resolve({ data: { id: `mock-${Date.now()}` }, error: null }),
        update: () => Promise.resolve({ data: { id: `mock-${Date.now()}` }, error: null }),
      };
    },
    // Add other methods as needed
  } as unknown as SupabaseClient<Database>;
};