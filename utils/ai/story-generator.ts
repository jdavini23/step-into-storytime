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

  const systemPrompt = `You are a master storyteller specializing in children's literature, with expertise in creating engaging, educational, and culturally sensitive stories.

Story Requirements:
- Target age: ${prompt.targetAge} years old
- Reading level: ${
    prompt.readingLevel
  } (This dictates complexity, vocabulary, sentence structure)
- Story length: Approximately ${
    prompt.durationMinutes || 5
  } minutes reading time (Adjust pacing and content amount to meet this duration)
- Language: ${prompt.language || 'en'} ${
    /* Default to English if not provided */ ''
  }
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
   - Appropriate pacing for the requested reading level and duration
   ${/* REMOVED length based on reading level */ ''}

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
  }, a ${prompt.character.age}-year-old ${
    prompt.character.gender ? prompt.character.gender + ' ' : ''
  }character who is ${prompt.character.traits.join(', ')}. 

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
- Use ${prompt.readingLevel} level vocabulary and sentence structure
- Ensure the overall story fits the target duration of approximately ${
    prompt.durationMinutes || 5
  } minutes.`;

  try {
    console.log('Generating story with prompt:', {
      targetAge: prompt.targetAge,
      readingLevel: prompt.readingLevel,
      durationMinutes: prompt.durationMinutes,
      theme: prompt.theme,
      setting: prompt.setting,
      characterName: prompt.character.name,
      // Avoid logging potentially sensitive/detailed info like full traits/appearance in production
    });

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

    // Robust title extraction (handles missing prefix)
    let title = `${prompt.character.name}'s Adventure`; // Default title
    if (titleLine && titleLine.toUpperCase().startsWith('TITLE:')) {
      title = titleLine.substring(6).trim();
    } else if (titleLine) {
      // Assume first line is title if prefix is missing
      title = titleLine.trim();
      console.warn(
        "AI response didn't start with TITLE:, assuming first line is title."
      );
    } else {
      console.warn('AI response seems empty or missing title line.');
    }

    // Split remaining content into paragraphs and clean up
    const paragraphs = contentLines
      .join('\n')
      .split('\n\n')
      .filter((para) => para.trim().length > 0);
    const content = paragraphs.join('\n\n');

    if (!content) {
      throw new Error('Failed to parse story content from AI response.');
    }

    // Return data that matches the database schema
    return {
      title: title,
      content: content,
      character: {
        name: prompt.character.name,
        age: prompt.character.age,
        gender: prompt.character.gender,
        traits: prompt.character.traits,
        appearance: prompt.character.appearance,
      },
      setting: prompt.setting,
      theme: prompt.theme,
      plot_elements: [], // Placeholder
      is_published: false,
      // Consider adding reading_level and duration_minutes to schema if needed
    };
  } catch (error) {
    console.error('Error generating story:', error);
    // Consider more specific error handling/re-throwing
    throw error;
  }
}
