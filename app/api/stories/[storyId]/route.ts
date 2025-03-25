import { NextResponse } from 'next/server';
import type { StoryData } from '@/components/story/common/types';

// Mock data for development
const mockStories: StoryData[] = [
  {
    id: 'demo-1',
    userId: 'demo-user',
    title: "Emma's Space Adventure",
    description: "A young girl's magical journey through space",
    content: {
      en: [
        'Emma gazed out of her bedroom window at the twinkling stars above. She had always dreamed of exploring space, and tonight was special - she could feel it in her bones.',
        'Suddenly, a soft blue light filled her room. Outside her window, a small, friendly-looking spaceship hovered, its lights pulsing gently like a heartbeat.',
        '"Hello, Emma," a cheerful voice chimed. "Would you like to go on an adventure?"',
        'Without hesitation, Emma nodded eagerly. This was the moment she had been waiting for. She climbed aboard the spaceship, and together with her new alien friend, they set off to explore the wonders of the galaxy.',
        "As they zoomed past Saturn's rings and through meteor showers that sparkled like diamond dust, Emma realized that sometimes the most amazing adventures begin right outside your window.",
      ],
      es: [],
    },
    mainCharacter: {
      name: 'Emma',
      age: '8',
      traits: ['curious', 'brave', 'creative'],
      appearance: 'A young girl with curly brown hair and bright green eyes',
    },
    setting: 'A distant galaxy filled with colorful planets',
    theme: 'Space Adventure',
    plotElements: ['discovery', 'friendship', 'exploration'],
    targetAge: 8,
    readingLevel: 'beginner',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    metadata: {
      targetAge: 8,
      difficulty: 'easy',
      theme: 'Space Adventure',
      setting: 'Space',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      wordCount: 120,
      readingTime: 3,
    },
    accessibility: {
      contrast: 'normal',
      motionReduced: false,
      fontSize: 'medium',
      lineHeight: 1.5,
    },
  },
];

// Initialize stories with mock data
let stories = [...mockStories];

export async function GET(
  request: Request,
  { params }: { params: { storyId: string } }
) {
  try {
    // Get the story ID from the URL params
    const storyId = params.storyId;
    if (!storyId) {
      return NextResponse.json(
        { error: 'Story ID is required' },
        { status: 400 }
      );
    }

    // Find story by ID
    const story = stories.find((s) => s.id === storyId);

    if (!story) {
      // If story is not found in memory, return the demo story for development
      const demoStory = mockStories.find((s) => s.id === 'demo-1');
      if (demoStory) {
        return NextResponse.json(demoStory);
      }
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    return NextResponse.json(story);
  } catch (error) {
    console.error('Error fetching story:', error);
    // Return the demo story in case of error (for development)
    const demoStory = mockStories.find((s) => s.id === 'demo-1');
    if (demoStory) {
      return NextResponse.json(demoStory);
    }
    return NextResponse.json(
      { error: 'Failed to fetch story' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { storyId: string } }
) {
  try {
    const storyId = params.storyId;
    const updates = await request.json();

    const storyIndex = stories.findIndex((s) => s.id === storyId);
    if (storyIndex === -1) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Update the story
    stories[storyIndex] = {
      ...stories[storyIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(stories[storyIndex]);
  } catch (error) {
    console.error('Error updating story:', error);
    return NextResponse.json(
      { error: 'Failed to update story' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { storyId: string } }
) {
  try {
    const storyId = params.storyId;
    if (!storyId) {
      return NextResponse.json(
        { error: 'Story ID is required' },
        { status: 400 }
      );
    }

    // Find and remove the story
    const storyIndex = stories.findIndex((s) => s.id === storyId);
    if (storyIndex === -1) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Remove the story
    stories = stories.filter((s) => s.id !== storyId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json(
      { error: 'Failed to delete story' },
      { status: 500 }
    );
  }
}
