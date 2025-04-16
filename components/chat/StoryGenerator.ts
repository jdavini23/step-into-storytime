import type { ConversationState } from './types';
import { z } from 'zod';
import {
  characterSchema,
  settingSchema,
  themeSchema,
  lengthSchema,
  type StoryData,
} from '@/lib/types';

// Story data validation schema
const storyDataSchema = z.object({
  character: characterSchema,
  setting: settingSchema,
  theme: themeSchema,
  length: lengthSchema,
});

type ValidatedStoryData = z.infer<typeof storyDataSchema>;

export async function generateStory(
  currentState: ConversationState,
  authState: { isAuthenticated: boolean; user?: { id: string } },
  setIsGenerating: (value: boolean) => void,
  handleError: (error: any, onError: (error: string) => void) => void,
  onError: (error: string) => void
) {
  if (!authState.isAuthenticated) {
    handleError(new Error('Please sign in to generate stories'), onError);
    return null;
  }

  try {
    setIsGenerating(true);
    const { storyData } = currentState;

    // Validate story data before sending
    const validatedData = storyDataSchema.parse(
      storyData
    ) as ValidatedStoryData;

    const prompt = {
      ...validatedData,
      character: {
        name: validatedData.character?.name || '',
        age: validatedData.character?.age || 8,
        traits: validatedData.character?.traits || ['friendly'],
        appearance: validatedData.character?.appearance || '',
        gender: validatedData.character?.gender || 'Male',
      },
    };

    const response = await fetch('/api/story/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate story');
    }

    const data = await response.json();

    // Create story in database
    const storyPayload = {
      id: crypto.randomUUID(),
      title: data.title,
      content: JSON.stringify(data.content),
      character: validatedData.character,
      setting: validatedData.setting,
      theme: validatedData.theme,
      length: validatedData.length,
      is_published: false,
      user_id: authState.user?.id,
      thumbnail_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const storyResponse = await fetch('/api/stories', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(storyPayload),
    });

    if (!storyResponse.ok) {
      const errorData = await storyResponse.json();
      throw new Error(
        errorData.error || `Failed to save story: ${storyResponse.status}`
      );
    }

    const savedStory = await storyResponse.json();
    return savedStory;
  } catch (error) {
    handleError(error, onError);
    return null;
  } finally {
    setIsGenerating(false);
  }
}
