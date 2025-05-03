import { createServerSupabaseClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: { storyId: string } }
) {
  try {
    const storyId = await params.storyId;
    
    if (!storyId || typeof storyId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid story ID' },
        { status: 400 }
      );
    }

    // Handle temporary IDs (for testing/development)
    if (storyId.startsWith('temp-')) {
      console.log(`[Story Verify API] Handling temporary ID: ${storyId}`);
      return NextResponse.json(
        { 
          exists: true, 
          id: storyId,
          created_at: new Date().toISOString(),
          isTemporary: true
        },
        { status: 200 }
      );
    }

    // Create Supabase client
    const supabase = await createServerSupabaseClient();
    
    // Check if the story exists
    const { data, error } = await supabase
      .from('stories')
      .select('id, created_at')
      .eq('id', storyId)
      .single();

    if (error) {
      console.error('[Story Verify API] Error checking story:', error);
      return NextResponse.json(
        { error: 'Failed to verify story', details: error.message },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { exists: false, message: 'Story not found' },
        { status: 404 }
      );
    }

    // Return success with minimal story data
    return NextResponse.json(
      { 
        exists: true, 
        id: data.id,
        created_at: data.created_at
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Story Verify API] Unexpected error:', error);
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
