import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { Story, StoryBranch } from '@/contexts/story-context';
import { generateStory } from '@/utils/ai/story-generator';
import { Story as StoryType } from '@/components/story/common/types';
import { createClient } from '@/utils/supabase/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    console.log('[DEBUG] POST /api/generate-story - Start');
    const supabase = await createClient();

    // Get user session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    console.log('[DEBUG] Auth check result:', {
      hasUser: !!user,
      userId: user?.id,
      hasError: !!authError,
      errorMessage: authError?.message,
      cookies: request.headers.get('cookie'),
      headers: Object.fromEntries(request.headers.entries()),
    });

    if (authError) {
      console.error('[DEBUG] Authentication error:', {
        error: authError,
        message: authError.message,
        status: authError.status,
      });
      return NextResponse.json(
        { error: `Authentication failed: ${authError.message}` },
        { status: 401 }
      );
    }

    if (!user) {
      console.error('[DEBUG] No user found in session');
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const json = await request.json();
    console.log('[DEBUG] Request payload:', {
      hasCharacter: !!json.character,
      characterName: json.character?.name,
      setting: json.setting,
      theme: json.theme,
      userId: user.id,
    });

    const {
      character,
      setting,
      theme,
      targetAge = 6,
      readingLevel = 'beginner',
      language = 'en',
    } = json;

    if (!character?.name || !setting || !theme) {
      console.error('[DEBUG] Missing required fields:', {
        hasCharacter: !!character,
        hasCharacterName: !!character?.name,
        hasSetting: !!setting,
        hasTheme: !!theme,
      });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    try {
      const storyContent = await generateStory({
        character: {
          ...character,
          appearance: character.appearance || '',
        },
        setting,
        theme,
        targetAge,
        readingLevel,
        language,
      });

      console.log('[DEBUG] Story generated successfully:', {
        hasContent: !!storyContent,
        contentLength: storyContent?.content?.length,
      });

      // Format response to match expected structure
      const formattedContent = {
        en: [storyContent.content], // Place the content directly in the array
        es: [],
      };

      return NextResponse.json({ content: formattedContent });
    } catch (error) {
      console.error('[DEBUG] Error generating story content:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error; // Re-throw to be caught by outer catch block
    }
  } catch (error) {
    console.error('[DEBUG] Error in POST /api/generate-story:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: 'Failed to generate story',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
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
  content: string;
  choices: string[];
} {
  // Split the response into content and choices
  const parts = response.split(/\n*Choices:\n*/i);
  const content = parts[0].trim();
  const choices = parts[1]
    ? parts[1]
        .split('\n')
        .map((choice) => choice.replace(/^[-*]\s*/, '').trim())
        .filter(Boolean)
    : [];

  return { content, choices };
}
