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
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await (await supabase).auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const { data: stories, error } = await (await supabase)
      .from('stories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching stories:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(stories);
  } catch (error) {
    console.error('Error in stories route:', error);
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
      // Generate the story using AI with optimized settings
      const generatedStory = await generateStory({
        character: json.character,
        theme: json.theme,
        setting: json.setting,
        targetAge: parseInt(json.character.age) || 6,
        readingLevel: json.readingLevel || 'beginner',
        language: json.language || 'en',
        style: json.style,
        educationalFocus: json.educationalFocus,
      });

      // Format story data to match database schema
      const storyData = {
        id: uuidv4(), // Generate a UUID for the story
        title: json.title || 'Untitled Story',
        description: json.description || '',
        content: {
          en: [json.content],
          es: [],
        },
        character: json.character,
        setting: json.setting,
        theme: json.theme,
        plot_elements: json.plot_elements || [],
        is_published: false,
        user_id: user.id,
        targetAge: json.targetAge || 6,
        readingLevel: json.readingLevel || 'beginner',
        thumbnail_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      console.log('Creating story with data:', storyData);

      // Use upsert for better performance
      const { data: story, error } = await supabase
        .from('stories')
        .upsert([storyData])
        .select()
        .single();

      if (error) {
        console.error('Error saving story:', error);
        return NextResponse.json(
          { error: 'Failed to save story' },
          { status: 500 }
        );
      }

      return NextResponse.json(story);
    } catch (error: any) {
      console.error('Error generating story:', error);
      return NextResponse.json(
        {
          error: 'Failed to generate story',
          details: error.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error in story creation endpoint:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
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
