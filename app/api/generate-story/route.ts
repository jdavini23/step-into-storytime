import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import type { Story, StoryBranch } from '@/contexts/story-context';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const storyData = await request.json();

    // Generate the initial story branch
    const initialBranchResponse = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a children's story writer creating an interactive branching narrative. 
          Create engaging, age-appropriate content with 2-3 choices at key decision points.
          Each branch should be 2-3 paragraphs long and lead to meaningful story variations.`,
        },
        {
          role: 'user',
          content: `Create an interactive children's story with the following elements:
          - Main character: ${storyData.mainCharacter.name}, age ${
            storyData.mainCharacter.age
          }
          - Character traits: ${storyData.mainCharacter.traits.join(', ')}
          - Setting: ${storyData.setting}
          - Theme: ${storyData.theme}
          - Plot elements: ${storyData.plotElements.join(', ')}
          
          Start with the opening scene and provide 2-3 choices for what happens next.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const initialBranch = initialBranchResponse.choices[0]?.message?.content;
    if (!initialBranch) {
      throw new Error('Failed to generate initial story branch');
    }

    // Parse the initial branch and choices
    const { content, choices } = parseStoryResponse(initialBranch);

    // Generate subsequent branches based on choices
    const branches: { [key: string]: StoryBranch } = {
      'branch-1': {
        id: 'branch-1',
        content,
        choices: await generateChoices(choices),
      },
    };

    // Generate branches for each choice
    for (const choice of branches['branch-1'].choices) {
      const branchResponse = await generateBranch(
        storyData,
        branches['branch-1'].content,
        choice.text
      );
      branches[choice.nextBranchId] = branchResponse;
    }

    return NextResponse.json({
      content: branches['branch-1'].content,
      branches,
      currentBranchId: 'branch-1',
    });
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
        - Main character: ${storyData.mainCharacter.name}
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
