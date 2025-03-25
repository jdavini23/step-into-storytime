import { NextRequest, NextResponse } from 'next/server';
import { StoryData } from '@/components/story/common/types';
import type { Story } from '@/contexts/story-context';

// In-memory storage for demo purposes
// TODO: Replace with database storage
let stories: Story[] = [];

export async function GET() {
  try {
    return NextResponse.json(stories);
  } catch (error) {
    console.error('Error fetching stories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const story = await request.json();

    // Add required fields
    const newStory = {
      ...story,
      id: story.id || Date.now().toString(),
      createdAt: story.createdAt || new Date().toISOString(),
      updatedAt: story.updatedAt || new Date().toISOString(),
    };

    // Add to stories array
    stories.push(newStory);

    return NextResponse.json(newStory);
  } catch (error) {
    console.error('Error creating story:', error);
    return NextResponse.json(
      { error: 'Failed to create story' },
      { status: 500 }
    );
  }
}

// [storyId]/route.ts handlers
export async function PUT(
  request: NextRequest,
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
    return NextResponse.json(
      { error: 'Failed to update story' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { storyId: string } }
) {
  try {
    const storyId = params.storyId;
    const storyIndex = stories.findIndex((s) => s.id === storyId);

    if (storyIndex === -1) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    // Remove the story
    stories = stories.filter((s) => s.id !== storyId);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete story' },
      { status: 500 }
    );
  }
}
