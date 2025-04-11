import { OpenAI } from 'openai';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Story, StoryPrompt, StoryBranch } from '@/lib/types';

// Initialize OpenAI client with API key from environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { prompt }: { prompt: StoryPrompt } = await request.json();

    // Generate story content using OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content:
            "You are a creative children's story writer. Write engaging, age-appropriate stories that are fun and educational.",
        },
        {
          role: 'user',
          content: `Write a children's story with the following details:
            - Main character: ${prompt.character.name}, age ${
            prompt.character.age
          }
            - Character traits: ${prompt.character.traits.join(', ')}
            - Setting: ${prompt.setting}
            - Theme: ${prompt.theme}
            - Target age: ${prompt.targetAge}
            - Reading level: ${prompt.readingLevel}
            - Language: ${prompt.language === 'es' ? 'Spanish' : 'English'}
            - Style: ${prompt.style}

            The story should be engaging, age-appropriate, and divided into paragraphs.`,
        },
      ],
    });

    const storyContent = completion.choices[0].message.content;
    if (!storyContent) {
      throw new Error('Failed to generate story content');
    }

    // Split content into paragraphs
    const paragraphs = storyContent
      .split('\n')
      .filter((p) => p.trim().length > 0);

    // Create story object
    const story: Story = {
      id: crypto.randomUUID(),
      title: `${prompt.character.name}'s Adventure`,
      content: storyContent,
      character: {
        name: prompt.character.name,
        age: Number(prompt.character.age),
        traits: prompt.character.traits,
      },
      setting: prompt.setting,
      theme: prompt.theme,
      plot_elements: [],
      is_published: false,
      user_id: user.id,
      thumbnail_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Save story to database
    const { error } = await supabase.from('stories').insert(story);

    if (error) {
      throw error;
    }

    return new Response(JSON.stringify(story), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error generating story:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate story' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function generateBranch(
  storyData: Story,
  previousContent: string,
  choiceText: string
): Promise<StoryBranch> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You are a children's story writer continuing an interactive branching narrative.
        Create the next part of the story based on the reader's choice.
        The content should be 2-3 paragraphs and provide 2-3 new choices unless it's a story ending.`,
      },
      {
        role: 'user',
        content: `Continue the story with these elements:
        - Previous content: ${previousContent}
        - Chosen path: ${choiceText}
        - Main character: ${storyData.character?.name || 'Unknown'}
        - Setting: ${storyData.setting}
        - Theme: ${storyData.theme}
        
        Provide the next scene and 2-3 choices for what happens next, or conclude the story if this branch reaches a natural ending.`,
      },
    ],
    temperature: 0.7,
    max_tokens: 1000,
  });

  const branchContent = response.choices[0]?.message?.content;
  if (!branchContent) {
    throw new Error('Failed to generate story branch');
  }

  const { content, choices } = parseStoryResponse(branchContent);
  const branchId = `branch-${Math.random().toString(36).substr(2, 9)}`;

  return {
    id: branchId,
    content,
    choices: await generateChoices(choices),
  };
}

async function generateChoices(
  choiceTexts: string[]
): Promise<{ text: string; nextBranchId: string }[]> {
  return choiceTexts.map((text) => ({
    text,
    nextBranchId: `branch-${Math.random().toString(36).substr(2, 9)}`,
  }));
}

function parseStoryResponse(response: string): {
  content: { en: string[]; es: string[] };
  choices: string[];
} {
  // Split the response into content and choices
  const parts = response.split(/\n*Choices:\n*/i);
  const contentText = parts[0].trim();
  const choices = parts[1]
    ? parts[1]
        .split('\n')
        .map((choice) => choice.replace(/^[-*]\s*/, '').trim())
        .filter(Boolean)
    : [];

  return {
    content: {
      en: contentText.split('\n').filter(Boolean),
      es: [],
    },
    choices,
  };
}
