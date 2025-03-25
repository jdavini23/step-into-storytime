import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// Initialize Supabase client
const supabase = createServerSupabaseClient();

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

    // Find story by ID using Supabase
    const { data: story, error } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .single();

    if (error) throw error;
    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(story);
  } catch (error) {
    console.error('Error fetching story:', error);
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
    const body = await request.json();

    // Update the story using Supabase
    const { data: story, error } = await supabase
      .from('stories')
      .update({ ...body, updatedAt: new Date().toISOString() })
      .eq('id', storyId)
      .select()
      .single();

    if (error) throw error;
    if (!story) {
      return NextResponse.json(
        { error: 'Story not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(story);
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

    // Delete the story using Supabase
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json(
      { error: 'Failed to delete story' },
      { status: 500 }
    );
  }
}
