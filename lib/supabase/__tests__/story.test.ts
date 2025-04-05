import { describe, expect, it, jest } from '@jest/globals';
import type { Database } from '@/types/supabase';
import { supabase } from '../client';
import { createStory, fetchStories } from '../story-operations';

type Story = Database['public']['Tables']['stories']['Row'];
type NewStory = Database['public']['Tables']['stories']['Insert'];
type SupabaseResponse<T> =
  | { data: T; error: null }
  | { data: null; error: Error };

const mockStory: NewStory = {
  title: 'Test Story',
  content: JSON.stringify({
    en: ['Once upon a time...'],
    es: [],
  }),
  character: {
    name: 'Test Character',
    age: '8',
    traits: ['brave', 'curious'],
  },
  setting: 'Test Setting',
  theme: 'Test Theme',
  plot_elements: [],
  is_published: false,
  user_id: 'test-user',
};

describe('Story API', () => {
  const mockUserId = 'test-user-id';

  describe('createStory', () => {
    it('should create a story successfully', async () => {
      const mockResponse: Story = {
        id: 'test-story-id',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: mockUserId,
        title: mockStory.title,
        content: mockStory.content || null,
        character: mockStory.character || null,
        setting: mockStory.setting || null,
        theme: mockStory.theme || null,
        plot_elements: mockStory.plot_elements || null,
        is_published: true,
        thumbnail_url: null,
      };

      const mockChain = {
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn(() =>
              Promise.resolve({
                data: mockResponse,
                error: null,
              } as SupabaseResponse<Story>)
            ),
          }),
        }),
      };

      jest.spyOn(supabase, 'from').mockReturnValue(mockChain as any);

      const result = await createStory(mockStory, mockUserId);
      expect(result).toEqual(mockResponse);
    });

    it('should handle errors when creating a story', async () => {
      const mockChain = {
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn(() =>
              Promise.resolve({
                data: null,
                error: new Error('Failed to create story'),
              } as SupabaseResponse<Story>)
            ),
          }),
        }),
      };

      jest.spyOn(supabase, 'from').mockReturnValue(mockChain as any);

      await expect(createStory(mockStory, mockUserId)).rejects.toThrow(
        'Failed to create story'
      );
    });
  });

  describe('fetchStories', () => {
    it('should fetch stories successfully', async () => {
      const mockStories: Story[] = [
        {
          id: 'story-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: mockUserId,
          title: mockStory.title,
          content: mockStory.content || null,
          character: mockStory.character || null,
          setting: mockStory.setting || null,
          theme: mockStory.theme || null,
          plot_elements: mockStory.plot_elements || null,
          is_published: true,
          thumbnail_url: null,
        },
        {
          id: 'story-2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          user_id: mockUserId,
          title: mockStory.title,
          content: mockStory.content || null,
          character: mockStory.character || null,
          setting: mockStory.setting || null,
          theme: mockStory.theme || null,
          plot_elements: mockStory.plot_elements || null,
          is_published: true,
          thumbnail_url: null,
        },
      ];

      const mockChain = {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            order: jest.fn(() =>
              Promise.resolve({
                data: mockStories,
                error: null,
              } as SupabaseResponse<Story[]>)
            ),
          }),
        }),
      };

      jest.spyOn(supabase, 'from').mockReturnValue(mockChain as any);

      const result = await fetchStories(mockUserId);
      expect(result).toEqual(mockStories);
    });
  });
});
