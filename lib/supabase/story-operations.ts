import { supabase } from './client';
import type { Database } from '@/types/supabase';

type Story = Database['public']['Tables']['stories']['Row'];
type NewStory = Database['public']['Tables']['stories']['Insert'];
type StoryUpdate = Database['public']['Tables']['stories']['Update'];

export async function createStory(
  storyData: NewStory,
  userId: string
): Promise<Story> {
  try {
    const { data, error } = await supabase
      .from('stories')
      .insert({
        ...storyData,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('No data returned from story creation');

    return data;
  } catch (error) {
    console.error('Create story error:', error);
    throw error;
  }
}

export async function fetchStories(userId: string): Promise<Story[]> {
  try {
    const { data, error } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Fetch stories error:', error);
    throw error;
  }
}

export async function updateStory(
  storyId: string,
  updates: StoryUpdate,
  userId: string
): Promise<Story> {
  try {
    const { data, error } = await supabase
      .from('stories')
      .update(updates)
      .eq('id', storyId)
      .eq('user_id', userId) // Security: ensure user owns the story
      .select()
      .single();

    if (error) throw error;
    if (!data)
      throw new Error('Story not found or user does not have permission');

    return data;
  } catch (error) {
    console.error('Update story error:', error);
    throw error;
  }
}

export async function deleteStory(
  storyId: string,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('stories')
      .delete()
      .match({ id: storyId, user_id: userId }); // Security: ensure user owns the story

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Delete story error:', error);
    throw error;
  }
}
