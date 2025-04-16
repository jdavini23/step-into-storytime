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
  const systemPrompt = `You are a master storyteller specializing in children's literature, with expertise in creating engaging, educational, and culturally sensitive stories.

Story Requirements:
- Target age: ${prompt.targetAge} years old
- Reading level: ${prompt.readingLevel}
- Style: ${prompt.style || 'general'}
${
  prompt.educationalFocus
    ? `- Educational focus: ${prompt.educationalFocus.join(', ')}`
    : ''
}

Core Elements:
1. Structure:
   - Engaging title that captures the story's essence
   - Clear three-act structure (setup, conflict, resolution)
   - Appropriate pacing for ${prompt.readingLevel} level
   - Story length: ${
     prompt.readingLevel === 'beginner'
       ? '3-5'
       : prompt.readingLevel === 'intermediate'
       ? '5-7'
       : '7-10'
   } minutes reading time

2. Language:
   - Vocabulary appropriate for ${prompt.readingLevel} level readers
   - Clear, concise sentences for beginner levels
   - More complex sentence structures for advanced levels
   - Natural, engaging dialogue with clear speaker attribution
   - Rich, sensory descriptions that bring scenes to life

3. Educational Value:
   - Incorporate age-appropriate learning opportunities
   - Include subtle moral lessons without being preachy
   - Encourage critical thinking through story events
   - Promote emotional intelligence and empathy
   - Include discussion prompts or questions when relevant

4. Cultural Considerations:
   - Ensure cultural sensitivity and inclusivity
   - Avoid stereotypes and biases
   - Celebrate diversity through characters and situations
   - Respect different perspectives and experiences

Format your response as:
TITLE: [Your engaging title here]

[Story content with clear paragraph breaks...]

[Optional: 2-3 discussion questions for parents/teachers]`;

  const userPrompt = `Create an engaging story about ${
    prompt.character.name
  }, a ${
    prompt.character.age
  }-year-old character who is ${prompt.character.traits.join(', ')}. 

Setting: ${prompt.setting}
Theme: ${prompt.theme}
${
  prompt.character.appearance
    ? `Character Appearance: ${prompt.character.appearance}`
    : ''
}

Key Guidelines:
- Focus on character growth and development
- Create relatable situations and challenges
- Include appropriate conflict resolution
- Maintain consistent character voice
- Balance dialogue and narrative
- Use ${prompt.readingLevel} level vocabulary and sentence structure`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 2500,
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
