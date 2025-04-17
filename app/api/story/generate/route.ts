import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import {
  createServerSupabaseClient,
  getServerSession,
  createServerSupabaseClientWithToken,
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
    // --- AUTHENTICATION HANDLING ---
    // 1. Check for Bearer token in Authorization header
    const authHeader =
      req.headers.get('authorization') || req.headers.get('Authorization');
    console.log(
      '[Story API] Received Authorization header:',
      authHeader
        ? `${authHeader.slice(0, 12)}...${authHeader.slice(-4)}`
        : 'none'
    );
    let supabase, session, user;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const accessToken = authHeader.replace('Bearer ', '').trim();
      console.log('[Story API] Using access token:', accessToken);
      // Validate the token by calling Supabase REST API
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        },
      });
      const userResText = await userRes.clone().text();
      console.log(
        '[Story API] Supabase REST API user response:',
        userRes.status,
        userResText
      );
      if (!userRes.ok) {
        console.error(
          '[Story API] Supabase REST API user validation failed:',
          userRes.status,
          userResText
        );
        return new Response(
          JSON.stringify({
            error: 'Authentication required',
            details: 'Invalid or expired token. Please sign in again.',
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }
      const userData = JSON.parse(userResText);
      user = userData;
      session = { user };
      // Create supabase client for DB operations WITH the token explicitly set
      supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: { Authorization: `Bearer ${accessToken}` },
          },
          auth: {
            persistSession: false,
            autoRefreshToken: false,
            detectSessionInUrl: false,
          },
        }
      );
      console.log(
        '[Story API] Explicitly created Supabase client with token for DB ops.'
      );

      console.log('[Story API] Authenticated via Bearer token (REST API):', {
        userId: user.id,
      });
      // --- Debug: Check what Supabase thinks the current user is ---
      try {
        // Use a direct SQL query to get auth.uid() as RPC('uid') might not exist
        const { data: uidData, error: uidError } = await supabase.rpc(
          'get_auth_uid'
        );
        // If get_auth_uid doesn't exist, you might need to create it:
        // CREATE OR REPLACE FUNCTION public.get_auth_uid() RETURNS uuid LANGUAGE sql SECURITY DEFINER AS $$ SELECT auth.uid(); $$;
        // GRANT EXECUTE ON FUNCTION public.get_auth_uid() TO authenticated;

        console.log('[Story API] Supabase auth.uid() via RPC:', {
          uidData,
          uidError,
        });
      } catch (e) {
        console.error(
          '[Story API] Error calling supabase.rpc("get_auth_uid"):',
          e
        );
        console.log(
          '[Story API] Attempting auth.getUser() as fallback check...'
        );
        // Fallback check using auth.getUser on the client instance
        const {
          data: { user: clientUser },
          error: clientUserError,
        } = await supabase.auth.getUser();
        console.log('[Story API] Result from supabase.auth.getUser():', {
          clientUserId: clientUser?.id,
          clientUserError,
        });
      }
    } else {
      // --- FALLBACK: Use cookies/session as before ---
      const cookieStore = await cookies();
      const authCookie = cookieStore.get('sb-access-token');
      const refreshCookie = cookieStore.get('sb-refresh-token');

      console.log('[Story API] Auth cookies present:', {
        hasAccessToken: !!authCookie,
        hasRefreshToken: !!refreshCookie,
      });

      supabase = await createServerSupabaseClient();
      console.log('[Story API] Supabase client created, getting session...');

      session = await getServerSession();

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
        data: { user: cookieUser },
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

      if (!cookieUser || cookieUser.id !== session.user.id) {
        console.error('[Story API] Session/User mismatch:', {
          sessionUserId: session.user.id,
          userId: cookieUser?.id,
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
      user = cookieUser;
      console.log('[Story API] User authenticated successfully:', {
        userId: user.id,
      });
      // --- Debug: Check what Supabase thinks the current user is ---
      try {
        // Use a direct SQL query to get auth.uid() as RPC('uid') might not exist
        const { data: uidData, error: uidError } = await supabase.rpc(
          'get_auth_uid'
        );
        // If get_auth_uid doesn't exist, you might need to create it:
        // CREATE OR REPLACE FUNCTION public.get_auth_uid() RETURNS uuid LANGUAGE sql SECURITY DEFINER AS $$ SELECT auth.uid(); $$;
        // GRANT EXECUTE ON FUNCTION public.get_auth_uid() TO authenticated;

        console.log('[Story API] Supabase auth.uid() via RPC:', {
          uidData,
          uidError,
        });
      } catch (e) {
        console.error(
          '[Story API] Error calling supabase.rpc("get_auth_uid"):',
          e
        );
        console.log(
          '[Story API] Attempting auth.getUser() as fallback check...'
        );
        // Fallback check using auth.getUser on the client instance
        const {
          data: { user: clientUser },
          error: clientUserError,
        } = await supabase.auth.getUser();
        console.log('[Story API] Result from supabase.auth.getUser():', {
          clientUserId: clientUser?.id,
          clientUserError,
        });
      }
    }

    const body = await req.json();
    const prompt = body.prompt || body;
    console.log(
      '[Story API] Received prompt:',
      JSON.stringify(prompt, null, 2)
    );

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

    console.log('[Story API] Inserting with user_id:', session.user.id);
    const { data: savedStory, error: saveError } = await supabase
      .from('stories')
      .insert([
        {
          user_id: session.user.id,
          title: story.title,
          content: story.content,
          character: prompt.character,
          setting: prompt.setting,
          theme: prompt.theme,
          length: prompt.length || parseInt(prompt.targetAge) || 5,
          readingLevel: prompt.readingLevel,
          language: prompt.language || 'en',
          style: prompt.style || 'default',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (saveError) {
      console.error('Error saving story:', saveError);
      return new Response(
        JSON.stringify({
          error: 'Failed to save story to database',
          details: saveError,
        }),
        { status: 500 }
      );
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
