import { NextRequest, NextResponse } from 'next/server';
import type { Story } from '@/contexts/story-context';
import { createClient } from '@/utils/supabase/server';
import { generateStory } from '@/utils/ai/story-generator';
import type { Database } from '@/types/supabase';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage for demo purposes
// TODO: Replace with database storage
// Consider using a more robust storage solution like a database
let stories: Story[] = [];

export async function GET(request: NextRequest) {
  try {
    console.log('[DEBUG] GET /api/stories - Start');
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
        { error: 'Unauthorized - No user session found' },
        { status: 401 }
      );
    }

    // Get stories for user
    console.log('[DEBUG] Fetching stories for user:', user.id);
    const { data: stories, error } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[DEBUG] Error fetching stories:', {
        error,
        userId: user.id,
      });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[DEBUG] Stories fetched successfully:', {
      count: stories?.length ?? 0,
      userId: user.id,
    });

    return NextResponse.json(stories);
  } catch (error) {
    console.error('[DEBUG] Unexpected error in GET /api/stories:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const json = await request.json();

    // Validate required fields
    if (!json.character || !json.theme || !json.setting) {
      return NextResponse.json(
        { error: 'Character, theme, and setting are required' },
        { status: 400 }
      );
    }

    try {
      // Format story data to match database schema
      const storyData = {
        id: json.id || crypto.randomUUID(),
        title: json.title || 'Untitled Story',
        content:
          typeof json.content === 'string'
            ? json.content
            : JSON.stringify(json.content),
        character: json.character,
        setting: json.setting,
        theme: json.theme,
        plot_elements: json.plot_elements || [],
        is_published: false,
        user_id: user.id,
        thumbnail_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('Creating story with data:', storyData);

      // Use insert instead of upsert since this is a new story
      const { data: story, error } = await supabase
        .from('stories')
        .insert([storyData])
        .select()
        .single();

      if (error) {
        console.error('Error saving story:', error);
        return NextResponse.json(
          { error: 'Failed to save story', details: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json(story);
    } catch (error: any) {
      console.error('Error saving story:', error);
      return NextResponse.json(
        {
          error: 'Failed to save story',
          details: error.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in story creation endpoint:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ storyId: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    // Get storyId from params if available
    const params = await context.params;
    const storyId = params?.storyId || id;

    // Verify story ownership
    const { data: existingStory } = await supabase
      .from('stories')
      .select('user_id')
      .eq('id', storyId)
      .single();

    if (!existingStory || existingStory.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Story not found or access denied' },
        { status: 403 }
      );
    }

    const { data: story, error } = await supabase
      .from('stories')
      .update(updateData)
      .eq('id', storyId)
      .select()
      .single();

    if (error) {
      console.error('Error updating story:', error);
      return NextResponse.json(
        { error: 'Failed to update story' },
        { status: 500 }
      );
    }

    return NextResponse.json({ story });
  } catch (error) {
    console.error('Unexpected error in PUT /api/stories:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ storyId: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    // Get storyId from params if available
    const params = await context.params;
    const storyId =
      params?.storyId || request.nextUrl.pathname.split('/').pop();

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
      .single();

    if (!existingStory || existingStory.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Story not found or access denied' },
        { status: 403 }
      );
    }

    const { error } = await supabase.from('stories').delete().eq('id', storyId);

    if (error) {
      console.error('Error deleting story:', error);
      return NextResponse.json(
        { error: 'Failed to delete story' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/stories:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
