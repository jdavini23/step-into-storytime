import OpenAI from 'openai';
import type { Database } from '@/types/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Story = Database['public']['Tables']['stories']['Row'];

type ReadingLevel = 'beginner' | 'intermediate' | 'advanced';

// Export the StoryPrompt interface
export interface StoryPrompt {
  character: {
    name: string;
    age: string; // Expecting string representation of age
    gender?: string;
    traits: string[];
    appearance?: string;
  };
  theme: string;
  setting: string;
  targetAge: number; // Derived from character.age usually
  readingLevel: ReadingLevel;
  durationMinutes?: number; // Added: Explicit duration control
  language: 'en' | 'es'; // Keep for future use, default handled below
  style?: 'adventure' | 'fantasy' | 'educational' | 'bedtime';
  educationalFocus?: string[];
}

export async function generateStory(
  prompt: StoryPrompt
): Promise<Partial<Story>> {
  // --- Input Validation ---
  if (
    !prompt.character?.name ||
    !prompt.character?.age ||
    !prompt.character?.traits?.length
  )
    throw new Error(
      'Missing required character information (name, age, traits).'
    );
  if (!prompt.setting) throw new Error('Missing required setting information.');
  if (!prompt.theme) throw new Error('Missing required theme information.');
  if (!prompt.readingLevel) throw new Error('Missing required readingLevel.');
  if (!prompt.targetAge || prompt.targetAge < 2 || prompt.targetAge > 12)
    throw new Error('Invalid targetAge.');
  if (
    prompt.durationMinutes &&
    (prompt.durationMinutes < 3 || prompt.durationMinutes > 20)
  ) {
    console.warn(
      'Requested durationMinutes outside typical range (3-20), using default 5.'
    );
    prompt.durationMinutes = 5; // Or adjust as needed
  }
  // --- End Validation ---

  try {
    console.log('Generating story with prompt:', {
      targetAge: prompt.targetAge,
      readingLevel: prompt.readingLevel,
      durationMinutes: prompt.durationMinutes,
      theme: prompt.theme,
      setting: prompt.setting,
      characterName: prompt.character.name,
    });

    // Skip OpenAI API call and use mock story generator
    console.log('Using mock story generator for testing');
    
    // Create a mock story based on the prompt
    const title = `${prompt.character.name}'s ${prompt.theme} Adventure in the ${prompt.setting}`;
    
    // Generate paragraphs based on the requested duration
    const paragraphCount = prompt.durationMinutes || 5;
    const paragraphs = [];
    
    // Introduction paragraph
    paragraphs.push(`Once upon a time, there was a ${prompt.character.age}-year-old ${prompt.character.gender || 'child'} named ${prompt.character.name}. ${prompt.character.name} was known for being ${prompt.character.traits.join(' and ')}. ${prompt.character.name} loved exploring and learning new things.`);
    
    // Setting paragraph
    paragraphs.push(`One day, ${prompt.character.name} found themselves in the ${prompt.setting}. It was a beautiful place, full of wonder and excitement. The ${prompt.setting} had colors and sounds that ${prompt.character.name} had never experienced before.`);
    
    // Theme-related paragraphs
    paragraphs.push(`As ${prompt.character.name} explored the ${prompt.setting}, they began to learn about ${prompt.theme}. ${prompt.theme} was something that ${prompt.character.name} had always been curious about.`);
    
    // Add more paragraphs based on duration
    for (let i = 0; i < paragraphCount - 3; i++) {
      paragraphs.push(`${prompt.character.name} discovered that ${prompt.theme} was more important than they had realized. Through their adventures in the ${prompt.setting}, they learned valuable lessons about ${prompt.theme} and about themselves.`);
    }
    
    // Conclusion paragraph
    paragraphs.push(`Finally, after their amazing adventure, ${prompt.character.name} returned home, feeling wiser and happier. They couldn't wait to share everything they had learned about ${prompt.theme} with their friends and family. The end.`);
    
    // Join paragraphs into content
    const content = paragraphs.join('\n\n');
    
    return {
      title,
      content,
      character: {
        name: prompt.character.name,
        age: prompt.character.age,
        gender: prompt.character.gender,
        traits: prompt.character.traits,
        appearance: prompt.character.appearance,
      },
      setting: prompt.setting,
      theme: prompt.theme,
      plot_elements: [],
      is_published: false,
    };
  } catch (error) {
    console.error('Error in story generation process:', error);
    throw new Error(`Story generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
