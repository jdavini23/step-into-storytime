import { NextRequest, NextResponse } from 'next/server';
import { StoryData } from '@/components/story/common/types';
import type { Story } from '@/contexts/story-context';
import { createClient } from '@/utils/supabase/server';

// In-memory storage for demo purposes
// TODO: Replace with database storage
let stories: Story[] = [];

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const { data: stories, error } = await supabase
      .from('stories')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching stories:', error);
      return NextResponse.json(
        { error: 'Failed to fetch stories' },
        { status: 500 }
      );
    }

    return NextResponse.json({ stories });
  } catch (error) {
    console.error('Unexpected error in GET /api/stories:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in' },
        { status: 401 }
      );
    }

    const json = await request.json();
    
    // Validate required fields
    if (!json.title || !json.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Ensure character_traits is an array
    if (json.character_traits && !Array.isArray(json.character_traits)) {
      json.character_traits = [json.character_traits];
    }

    // Ensure accessibility_settings is an object
    if (typeof json.accessibility_settings !== 'object') {
      json.accessibility_settings = {
        contrast: 'normal',
        motion_reduced: false,
        font_size: 'medium',
        line_height: 1.5
      };
    }

    // Convert target_age to number
    if (json.target_age) {
      json.target_age = parseInt(json.target_age.toString(), 10);
    }

    // Convert word_count and reading_time to numbers
    json.word_count = parseInt(json.word_count?.toString() || '0', 10);
    json.reading_time = parseInt(json.reading_time?.toString() || '0', 10);

    // Prepare story data
    const storyData = {
      ...json,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      reading_level: json.reading_level || 'beginner',
      status: json.status || 'draft',
      character_traits: json.character_traits || [],
      accessibility_settings: json.accessibility_settings
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
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

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
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

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

    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId);

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
