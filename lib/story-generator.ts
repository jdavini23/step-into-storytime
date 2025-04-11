import type { Story } from '@/components/story/common/types';
import type { StoryData } from '@/components/chat/types';

export async function generateStory(storyData: StoryData): Promise<Story> {
  try {
    // First, generate the story content
    const generationResponse = await fetch('/api/generate-story/', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: `${storyData.mainCharacter.name}'s Adventure`,
        character: {
          name: storyData.mainCharacter.name,
          age: storyData.mainCharacter.age,
          traits: storyData.mainCharacter.traits,
        },
        setting: storyData.setting,
        theme: storyData.theme,
        plotElements: storyData.plotElements,
        length: storyData.length,
      }),
    });

    if (!generationResponse.ok) {
      const errorData = await generationResponse.json();
      throw new Error(
        errorData.error ||
          `Failed to generate story: ${generationResponse.status}`
      );
    }

    const generatedContent = await generationResponse.json();

    // Then, save the story to the database
    const storyPayload = {
      id: crypto.randomUUID(),
      title: `${storyData.mainCharacter.name}'s Adventure`,
      content: JSON.stringify(generatedContent.content),
      character: {
        name: storyData.mainCharacter.name,
        age: storyData.mainCharacter.age,
        traits: storyData.mainCharacter.traits,
      },
      setting: storyData.setting,
      theme: storyData.theme,
      plot_elements: storyData.plotElements,
      is_published: false,
      thumbnail_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const saveResponse = await fetch('/api/stories', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(storyPayload),
    });

    if (!saveResponse.ok) {
      const errorData = await saveResponse.json();
      throw new Error(
        errorData.error || `Failed to save story: ${saveResponse.status}`
      );
    }

    return await saveResponse.json();
  } catch (error) {
    console.error('Story generation error:', error);
    throw error;
  }
}
