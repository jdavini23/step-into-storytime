import OpenAI from 'openai';
import { StoryData } from '@/components/story/common/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
): Promise<Partial<StoryData>> {
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
- Be engaging and imaginative
- Include clear moral lessons or educational elements
- Use age-appropriate vocabulary and sentence structure
- Have a clear beginning, middle, and end
- Include descriptive language and dialogue
- Encourage critical thinking and emotional intelligence`;

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

    // Split into paragraphs and clean up
    const paragraphs = storyContent
      .split('\n\n')
      .filter((para) => para.trim().length > 0);

    // Generate a title based on the story
    const titleCompletion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            "Generate a short, engaging title for this children's story. The title should be catchy and reflect the main theme or adventure.",
        },
        { role: 'user', content: storyContent },
      ],
      temperature: 0.7,
      max_tokens: 50,
    });

    const title =
      titleCompletion.choices[0].message.content?.trim() ||
      `${prompt.character.name}'s Adventure`;

    // Generate a brief description
    const descriptionCompletion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content:
            "Generate a brief, engaging description (2-3 sentences) for this children's story.",
        },
        { role: 'user', content: storyContent },
      ],
      temperature: 0.7,
      max_tokens: 100,
    });

    const description =
      descriptionCompletion.choices[0].message.content?.trim() || '';

    // Calculate basic metadata
    const wordCount = storyContent.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // Assuming 200 words per minute for children

    return {
      title,
      description,
      content: {
        en: prompt.language === 'en' ? paragraphs : [],
        es: prompt.language === 'es' ? paragraphs : [],
      },
      mainCharacter: prompt.character,
      setting: prompt.setting,
      theme: prompt.theme,
      targetAge: prompt.targetAge,
      readingLevel: prompt.readingLevel,
      metadata: {
        targetAge: prompt.targetAge,
        difficulty:
          prompt.readingLevel === 'beginner'
            ? 'easy'
            : prompt.readingLevel === 'intermediate'
            ? 'medium'
            : 'hard',
        theme: prompt.theme,
        setting: prompt.setting,
        wordCount,
        readingTime,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('Error generating story:', error);
    throw error;
  }
}
