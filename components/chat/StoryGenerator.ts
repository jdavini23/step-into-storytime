import type { ConversationState } from './types';
import { SETTINGS, THEMES } from '@/lib/story-options';

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

    const payload = {
      title: `${storyData.character?.name}'s ${
        SETTINGS.find((s) => s.id === storyData.setting)?.title || 'Adventure'
      }`,
      character: {
        name: storyData.character?.name || '',
        age: storyData.character?.age || '',
        traits: storyData.character?.traits || [],
      },
      setting: SETTINGS.find((s) => s.id === storyData.setting)?.id || '',
      theme: THEMES.find((t) => t.id === storyData.theme)?.id || '',
      plotElements: [],
    };

    const response = await fetch('/api/generate-story/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to generate story');
    }

    const data = await response.json();

    // Create story in Supabase
    const selectedSetting = SETTINGS.find((s) => s.id === storyData.setting);
    const selectedTheme = THEMES.find((t) => t.id === storyData.theme);

    const storyPayload = {
      id: crypto.randomUUID(),
      title: `${storyData.character?.name}'s ${
        selectedSetting?.title || 'Adventure'
      }`,
      content: JSON.stringify(data.content),
      character: {
        name: storyData.character?.name || '',
        age: storyData.character?.age || '',
        traits: storyData.character?.traits || [],
      },
      setting: selectedSetting?.id,
      theme: selectedTheme?.id,
      plot_elements: [],
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
