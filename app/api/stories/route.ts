import { NextRequest, NextResponse } from 'next/server';
import { StoryData } from '@/components/story/common/types';
import type { Story } from '@/contexts/story-context';
import { createClient } from '@/utils/supabase/server';
import { generateStory } from '@/utils/ai/story-generator';
import type { Database } from '@/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

// In-memory storage for demo purposes
// TODO: Replace with database storage
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
      // Generate the story using AI
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

      // Prepare story data for database
      const storyData = {
        title: generatedStory.title,
        description: generatedStory.description,
        main_character: generatedStory.mainCharacter,
        setting: generatedStory.setting,
        theme: generatedStory.theme,
        content: generatedStory.content,
        target_age: generatedStory.targetAge,
        reading_level: generatedStory.readingLevel,
        metadata: generatedStory.metadata,
        plot_elements: [],
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: story, error } = await supabase
        .from('stories')
        .insert([storyData])
        .select()
        .single();

      if (error) {
        console.error('Error creating story:', error);
        return NextResponse.json(
          { error: error.message || 'Failed to create story' },
          { status: 500 }
        );
      }

      return NextResponse.json({ story });
    } catch (error) {
      console.error('Error generating story:', error);
      return NextResponse.json(
        { error: 'Failed to generate story' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Unexpected error in POST /api/stories:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { storyId: string } }
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

    // Verify story ownership
    const { data: existingStory } = await supabase
      .from('stories')
      .select('user_id')
      .eq('id', id)
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
      .eq('id', id)
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
  { params }: { params: { storyId: string } }
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

    const storyId = params.storyId;

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
