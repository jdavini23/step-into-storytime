import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { supabase } from '../client';
import {
  createStory,
  fetchStories,
  updateStory,
  deleteStory,
} from '../story-operations';
import type { Database } from '@/types/supabase';

type Story = Database['public']['Tables']['stories']['Row'];
type NewStory = Database['public']['Tables']['stories']['Insert'];

// Mock story data
const mockStory: NewStory = {
  user_id: 'test-user-id',
  title: 'Test Story',
  content: 'Once upon a time...',
  main_character: {
    name: 'Test Character',
    age: '8',
    traits: ['brave', 'curious'],
  },
  setting: 'magical forest',
  theme: 'adventure',
  plot_elements: ['magic spell', 'talking animals'],
  is_published: true,
};

const mockUserId = 'test-user-id';

describe('Story Operations', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('createStory', () => {
    it('should create a story successfully', async () => {
      const mockResponse = {
        data: {
          ...mockStory,
          id: 'test-story-id',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Story,
        error: null,
      };

      const mockChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue(mockResponse),
      };

      jest.spyOn(supabase, 'from').mockReturnValue(mockChain as any);

      const result = await createStory(mockStory, mockUserId);

      expect(result).toEqual(mockResponse.data);
      expect(mockChain.insert).toHaveBeenCalledWith({
        ...mockStory,
        user_id: mockUserId,
      });
    });

    it('should handle creation errors', async () => {
      const mockError = new Error('Failed to create story');
      const mockChain = {
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockRejectedValue(mockError),
      };

      jest.spyOn(supabase, 'from').mockReturnValue(mockChain as any);

      await expect(createStory(mockStory, mockUserId)).rejects.toThrow(
        'Failed to create story'
      );
    });
  });

  describe('fetchStories', () => {
    it('should fetch stories for a user', async () => {
      const mockStories = [
        {
          ...mockStory,
          id: 'story-1',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Story,
        {
          ...mockStory,
          id: 'story-2',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        } as Story,
      ];

      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockStories, error: null }),
      };

      jest.spyOn(supabase, 'from').mockReturnValue(mockChain as any);

      const result = await fetchStories(mockUserId);

      expect(result).toEqual(mockStories);
      expect(mockChain.select).toHaveBeenCalledWith('*');
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', mockUserId);
    });

    it('should handle fetch errors', async () => {
      const mockError = new Error('Fetch failed');
      const mockChain = {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      jest.spyOn(supabase, 'from').mockReturnValue(mockChain as any);

      await expect(fetchStories(mockUserId)).rejects.toThrow('Fetch failed');
    });
  });

  describe('updateStory', () => {
    it('should update a story successfully', async () => {
      const storyId = 'test-story-id';
      const updates = { title: 'Updated Title' };
      const mockUpdatedStory = {
        ...mockStory,
        ...updates,
        id: storyId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as Story;

      const mockChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest
          .fn()
          .mockResolvedValue({ data: mockUpdatedStory, error: null }),
      };

      jest.spyOn(supabase, 'from').mockReturnValue(mockChain as any);

      const result = await updateStory(storyId, updates, mockUserId);

      expect(result).toEqual(mockUpdatedStory);
      expect(mockChain.update).toHaveBeenCalledWith(updates);
      expect(mockChain.eq).toHaveBeenCalledWith('id', storyId);
      expect(mockChain.eq).toHaveBeenCalledWith('user_id', mockUserId);
    });

    it('should handle update errors', async () => {
      const storyId = 'test-story-id';
      const updates = { title: 'Updated Title' };
      const mockError = new Error('Update failed');

      const mockChain = {
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      };

      jest.spyOn(supabase, 'from').mockReturnValue(mockChain as any);

      await expect(updateStory(storyId, updates, mockUserId)).rejects.toThrow(
        'Update failed'
      );
    });
  });

  describe('deleteStory', () => {
    it('should delete a story successfully', async () => {
      const storyId = 'test-story-id';

      const mockChain = {
        delete: jest.fn().mockReturnThis(),
        match: jest.fn().mockResolvedValue({ error: null }),
      };

      jest.spyOn(supabase, 'from').mockReturnValue(mockChain as any);

      const result = await deleteStory(storyId, mockUserId);

      expect(result).toBe(true);
      expect(mockChain.delete).toHaveBeenCalled();
      expect(mockChain.match).toHaveBeenCalledWith({
        id: storyId,
        user_id: mockUserId,
      });
    });

    it('should handle deletion errors', async () => {
      const storyId = 'test-story-id';
      const mockError = new Error('Delete failed');

      const mockChain = {
        delete: jest.fn().mockReturnThis(),
        match: jest.fn().mockResolvedValue({ error: mockError }),
      };

      jest.spyOn(supabase, 'from').mockReturnValue(mockChain as any);

      await expect(deleteStory(storyId, mockUserId)).rejects.toThrow(
        'Delete failed'
      );
    });
  });
});
