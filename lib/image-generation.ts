import type { Story } from '@/contexts/story-context';

export async function generateStoryIllustrations(story: Story) {
  const scenes = extractKeyScenes(story.content || '');
  const illustrations = [];

  for (const scene of scenes) {
    const prompt = generateImagePrompt(scene, story);
    try {
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate image');
      }

      const data = await response.json();
      illustrations.push({
        url: data.url,
        prompt,
        scene,
      });
    } catch (error) {
      console.error('Error generating illustration:', error);
    }
  }

  return illustrations;
}

function extractKeyScenes(content: string): string[] {
  // Split content into paragraphs
  const paragraphs = content.split('\n\n');

  // Select key paragraphs for illustration (e.g., beginning, middle, end)
  const keyScenes = [];

  if (paragraphs.length >= 1) {
    keyScenes.push(paragraphs[0]); // Opening scene
  }

  if (paragraphs.length >= 3) {
    keyScenes.push(paragraphs[Math.floor(paragraphs.length / 2)]); // Middle scene
  }

  if (paragraphs.length >= 2) {
    keyScenes.push(paragraphs[paragraphs.length - 1]); // Closing scene
  }

  return keyScenes;
}

function generateImagePrompt(scene: string, story: Story): string {
  // Create a child-friendly, detailed prompt for DALL-E
  const basePrompt = `Create a whimsical, child-friendly illustration for a children's story. The scene shows ${scene}`;

  // Add story context
  const context = `The story is about ${story.mainCharacter.name}, who is ${story.mainCharacter.age} years old, and takes place in ${story.setting}.`;

  // Add style guidance
  const style =
    "The style should be colorful, engaging, and suitable for children, with soft edges and warm colors. Make it magical and inviting, like a high-quality children's book illustration.";

  return `${basePrompt} ${context} ${style}`;
}
