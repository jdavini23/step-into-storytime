import { OpenAI } from 'openai';
import {
  createServerSupabaseClient,
  getServerSession,
} from '@/lib/supabase/server';
import { Story, StoryPrompt, StoryBranch } from '@/lib/types';
import { generateStory } from '@/utils/ai/story-generator';
import { cookies } from 'next/headers';

// Initialize OpenAI client with API key from environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Remove edge runtime config
// export const runtime = 'edge';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  console.log('[Story API] Starting story generation request...');

  try {
    // Log available cookies for debugging
    const cookieStore = await cookies();
    const authCookie = cookieStore.get('sb-access-token');
    const refreshCookie = cookieStore.get('sb-refresh-token');

    console.log('[Story API] Auth cookies present:', {
      hasAccessToken: !!authCookie,
      hasRefreshToken: !!refreshCookie,
    });

    const supabase = await createServerSupabaseClient();
    console.log('[Story API] Supabase client created, getting session...');

    const session = await getServerSession();

    console.log('[Story API] Session check:', {
      hasSession: !!session,
      userId: session?.user?.id,
      timestamp: new Date().toISOString(),
    });

    if (!session?.user?.id) {
      console.error('[Story API] No authenticated user found');
      return new Response(
        JSON.stringify({
          error: 'Authentication required',
          details: 'No valid session found. Please sign in again.',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Verify the session is still valid
    console.log('[Story API] Verifying user...');
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error('[Story API] User verification failed:', userError);
      return new Response(
        JSON.stringify({
          error: 'Session validation failed',
          details: userError.message,
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    if (!user || user.id !== session.user.id) {
      console.error('[Story API] Session/User mismatch:', {
        sessionUserId: session.user.id,
        userId: user?.id,
      });
      return new Response(
        JSON.stringify({
          error: 'Invalid session',
          details: 'User ID mismatch. Please sign in again.',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    console.log('[Story API] User authenticated successfully:', {
      userId: user.id,
    });

    const prompt = await req.json();

    // Validate required prompt fields
    const requiredFields = [
      'character',
      'theme',
      'setting',
      'targetAge',
      'readingLevel',
    ];
    const missingFields = requiredFields.filter((field) => !prompt[field]);

    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({
          error: `Missing required fields: ${missingFields.join(', ')}`,
          fields: missingFields,
        }),
        { status: 400 }
      );
    }

    // Validate character object
    const requiredCharacterFields = ['name', 'age', 'traits'];
    const missingCharacterFields = requiredCharacterFields.filter(
      (field) => !prompt.character[field]
    );

    if (missingCharacterFields.length > 0) {
      return new Response(
        JSON.stringify({
          error: `Missing required character fields: ${missingCharacterFields.join(
            ', '
          )}`,
          fields: missingCharacterFields,
        }),
        { status: 400 }
      );
    }

    // Validate reading level
    const validReadingLevels = ['beginner', 'intermediate', 'advanced'];
    if (!validReadingLevels.includes(prompt.readingLevel)) {
      return new Response(
        JSON.stringify({
          error:
            'Invalid reading level. Must be one of: beginner, intermediate, advanced',
          field: 'readingLevel',
        }),
        { status: 400 }
      );
    }

    // Validate target age
    const age = parseInt(prompt.targetAge);
    if (isNaN(age) || age < 3 || age > 12) {
      return new Response(
        JSON.stringify({
          error: 'Target age must be a number between 3 and 12',
          field: 'targetAge',
        }),
        { status: 400 }
      );
    }

    console.log(
      'Generating story with prompt:',
      JSON.stringify(prompt, null, 2)
    );

    const story = await generateStory(prompt);

    if (!story.title || !story.content) {
      throw new Error('Failed to generate story content');
    }

    const { data: savedStory, error: saveError } = await supabase
      .from('stories')
      .insert([
        {
          user_id: session.user.id,
          title: story.title,
          content: story.content,
          prompt: prompt,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (saveError) {
      console.error('Error saving story:', saveError);
      throw new Error('Failed to save story to database');
    }

    return new Response(JSON.stringify(savedStory), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in story generation:', error);
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred',
      }),
      { status: 500 }
    );
  }
}

// --- (Other helper functions for branching, parsing, etc. can be copied here if needed) ---
