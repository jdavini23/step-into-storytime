import OpenAI from 'openai';
import type { Database } from '@/types/supabase';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Story = Database['public']['Tables']['stories']['Row'];

interface StoryPrompt {
  character: {
    name: string;
    age: string;
    traits: string[];
    appearance: string;
  };
  theme: string;
  setting: string;
  targetAge: number;
  readingLevel: 'beginner' | 'intermediate' | 'advanced';
  language: 'en' | 'es';
  style?: 'adventure' | 'fantasy' | 'educational' | 'bedtime';
  educationalFocus?: string[];
}

export async function generateStory(
  prompt: StoryPrompt
): Promise<Partial<Story>> {
  const systemPrompt = `You are a master storyteller specializing in children's literature. 
Create an engaging, age-appropriate story with the following characteristics:
- Target age: ${prompt.targetAge} years old
- Reading level: ${prompt.readingLevel}
- Style: ${prompt.style || 'general'}
${
  prompt.educationalFocus
    ? `- Educational focus: ${prompt.educationalFocus.join(', ')}`
    : ''
}

The story should:
- Start with a catchy, engaging title on the first line
- Be engaging and imaginative
- Include clear moral lessons or educational elements
- Use age-appropriate vocabulary and sentence structure
- Have a clear beginning, middle, and end
- Include descriptive language and dialogue
- Encourage critical thinking and emotional intelligence

Format your response as:
TITLE: [Your catchy title here]

[Story content here...]`;

  const userPrompt = `Create a story about ${prompt.character.name}, a ${
    prompt.character.age
  }-year-old character who is ${prompt.character.traits.join(', ')}. 
The story is set in ${prompt.setting} and explores the theme of ${prompt.theme}.
${
  prompt.character.appearance
    ? `The character appears as: ${prompt.character.appearance}`
    : ''
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 2000,
      frequency_penalty: 0.5,
      presence_penalty: 0.3,
    });

    const storyContent = completion.choices[0].message.content;
    if (!storyContent) throw new Error('No story content generated');

    // Extract title and content
    const [titleLine, ...contentLines] = storyContent
      .split('\n')
      .filter((line) => line.trim());
    const title = titleLine.replace(/^TITLE:\s*/, '').trim();

    // Split remaining content into paragraphs and clean up
    const paragraphs = contentLines
      .join('\n')
      .split('\n\n')
      .filter((para) => para.trim().length > 0);

    // Return data that matches the database schema
    return {
      title: title || `${prompt.character.name}'s Adventure`,
      content: paragraphs.join('\n\n'),
      character: {
        name: prompt.character.name,
        age: prompt.character.age,
        traits: prompt.character.traits,
        appearance: prompt.character.appearance,
      },
      setting: prompt.setting,
      theme: prompt.theme,
      plot_elements: [],
      is_published: false,
    };
  } catch (error) {
    console.error('Error generating story:', error);
    throw error;
  }
}
