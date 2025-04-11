import type { Story, StoryData } from '@/lib/types';

export async function generateStory(storyData: StoryData): Promise<Story> {
  try {
    const response = await fetch('/api/generate-story', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: {
          character: {
            name: storyData.character?.name || '',
            traits: storyData.character?.traits || [],
            appearance: '',
          },
          theme: storyData.theme || '',
          setting: storyData.setting || '',
          targetAge: 8,
          readingLevel: 'beginner',
          language: 'en',
          style: 'bedtime',
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate story');
    }

    const story: Story = await response.json();

    // Format the story data
    return {
      ...story,
      character: {
        name: storyData.character?.name || '',
        age: storyData.character?.age || 0,
        traits: storyData.character?.traits || [],
      },
      setting: storyData.setting || '',
      theme: storyData.theme || '',
      length: storyData.length || 'medium',
    };
  } catch (error) {
    console.error('Error generating story:', error);
    throw error;
  }
}
