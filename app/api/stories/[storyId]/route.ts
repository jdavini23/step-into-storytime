import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface StoryParams {
  storyId: string;
}

interface RouteContext {
  params: Promise<{ storyId: string }>;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ storyId: string }> }
): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const params = await context.params;
    const storyId = params.storyId;

    if (!storyId) {
      return NextResponse.json(
        { error: 'Story ID is required' },
        { status: 400 }
      );
    }

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      console.error('Auth error:', authError);
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Find story by ID and verify ownership
    const { data: story, error: dbError } = await supabase
      .from('stories')
      .select('*')
      .eq('id', storyId)
      .eq('user_id', user.id)
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to fetch story' },
        { status: 500 }
      );
    }

    if (!story) {
      return NextResponse.json(
        { error: 'Story not found or access denied' },
        { status: 404 }
      );
    }

    return NextResponse.json(story);
  } catch (error) {
    console.error('Unexpected error in GET /api/stories/[storyId]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ storyId: string }> }
): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const storyId = params.storyId;
    const body = await request.json();

    // Verify story ownership
    const { data: existingStory } = await supabase
      .from('stories')
      .select('user_id')
      .eq('id', storyId)
      .eq('user_id', user.id)
      .single();

    if (!existingStory) {
      return NextResponse.json(
        { error: 'Story not found or access denied' },
        { status: 403 }
      );
    }

    // Validate content structure
    if (!body.content || typeof body.content !== 'object') {
      return NextResponse.json(
        { error: 'Invalid content format - content must be an object' },
        { status: 400 }
      );
    }

    if (!Array.isArray(body.content.en) || !Array.isArray(body.content.es)) {
      return NextResponse.json(
        {
          error: 'Invalid content format - content must have en and es arrays',
        },
        { status: 400 }
      );
    }

    // Format the update data
    const updateData = {
      ...body,
      content: JSON.stringify(body.content), // Stringify for database storage
      updated_at: new Date().toISOString(),
    };

    // Update the story
    const { data: story, error } = await supabase
      .from('stories')
      .update(updateData)
      .eq('id', storyId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating story:', error);
      return NextResponse.json(
        { error: 'Failed to update story' },
        { status: 500 }
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
  request: NextRequest,
  context: { params: Promise<{ storyId: string }> }
): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const params = await context.params;
    const storyId = params.storyId;

    if (!storyId) {
      return NextResponse.json(
        { error: 'Story ID is required' },
        { status: 400 }
      );
    }

    // Verify story ownership
    const { data: existingStory } = await supabase
      .from('stories')
      .select('user_id')
      .eq('id', storyId)
      .eq('user_id', user.id)
      .single();

    if (!existingStory) {
      return NextResponse.json(
        { error: 'Story not found or access denied' },
        { status: 403 }
      );
    }

    // Delete the story
    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting story:', error);
      return NextResponse.json(
        { error: 'Failed to delete story' },
        { status: 500 }
      );
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
