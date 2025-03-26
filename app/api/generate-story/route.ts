import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { Story, StoryBranch } from '@/contexts/story-context';
import { generateStory } from '@/utils/ai/story-generator';
import { Story as StoryType } from '@/components/story/common/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const runtime = 'edge';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const {
      character,
      setting,
      theme,
      targetAge = 6,
      readingLevel = 'beginner',
      language = 'en',
    } = json;

    if (!character?.name || !setting || !theme) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

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

    return NextResponse.json({ content: storyContent });
  } catch (error) {
    console.error('Error generating story:', error);
    return NextResponse.json(
      { error: 'Failed to generate story' },
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
