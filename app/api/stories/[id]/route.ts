import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
);

export async function GET(
  request: Request,
  { params }: { params={ id: string } }
) {
  try {
    // Get story by ID
    const { data: story, error } = await supabase
      .from('stories')
      .select('*')
      .eq('id', params.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (!story) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
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
  { params }: { params={ id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    // Get user ID from session (simulated)
    const userId = request.headers.get('x-user-id') || 'demo-user';

    // Find story index
    const storyIndex = stories.findIndex((s) => s.id === id);

    if (storyIndex === -1) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }
    // Update story
    // Fetch the existing story from the database
    const { data: existingStory, error: fetchError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching story for update:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 400 });
    }

    if (!existingStory) {
      return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    }

    const updatedStory = {
      ...existingStory,
      ...body,
      id, // Ensure ID doesn't change
      userId: existingStory.userId, // Ensure userId doesn't change
      updatedAt: new Date().toISOString(),
    };
    };

    const { data, error } = await supabase
      .from('stories')
      .update(updatedStory)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating story:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error updating story:', error);
    return NextResponse.json(
      { error: 'Failed to update story' },
      { status: 500 }
    );
  }

export async function DELETE(
  request: Request,
  { params }: { params={ id: string } }
) {
  try {
    const id = params.id;

    // Get user ID from session (simulated)
    const userId = request.headers.get('x-user-id') || 'demo-user';

    // Find story index
    // const storyIndex = stories.findIndex((s) => s.id === id);

    // if (storyIndex === -1) {
    //   return NextResponse.json({ error: 'Story not found' }, { status: 404 });
    // }
    // Remove story
    // stories.splice(storyIndex, 1);

    const { error } = await supabase.from('stories').delete().eq('id', id);

    if (error) {
      console.error('Error deleting story:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting story:', error);
    return NextResponse.json(
      { error: 'Failed to delete story' },
      { status: 500 }
    );
  }
}
