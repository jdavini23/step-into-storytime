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

// Import the specific types
import type {
  WizardData,
  CharacterData,
  ReadingLevel,
} from '@/components/wizard-ui/wizard-context';
import type { StoryPrompt as GeneratorStoryPrompt } from '@/utils/ai/story-generator';

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

    // --- PARSE AND VALIDATE INCOMING WIZARD DATA ---
    const body = await req.json();
    // Log the raw body FIRST
    console.log(
      '[Story API] Raw request body received:',
      JSON.stringify(body, null, 2)
    );

    // Assuming frontend sends the data object directly or nested under 'prompt'
    const wizardData: WizardData = body.prompt || body;
    console.log(
      '[Story API] Received wizard data:',
      JSON.stringify(wizardData, null, 2)
    );

    // Validate required wizardData fields *before* mapping
    if (
      !wizardData.character?.name ||
      !wizardData.character?.age ||
      !wizardData.character?.traits?.length
    )
      throw new Error(
        'Missing required character info (name, age, traits) in request.'
      );
    if (!wizardData.setting) throw new Error('Missing setting in request.');
    if (!wizardData.theme) throw new Error('Missing theme in request.');
    if (!wizardData.length) throw new Error('Missing length in request.');
    if (!wizardData.readingLevel)
      throw new Error('Missing readingLevel in request.');

    // Validate character age
    const ageNum = Number(wizardData.character.age);
    if (isNaN(ageNum) || ageNum < 2 || ageNum > 12) {
      throw new Error('Invalid character age. Must be between 2 and 12.');
    }

    // Validate reading level
    const validReadingLevels: ReadingLevel[] = [
      'beginner',
      'intermediate',
      'advanced',
    ];
    if (!validReadingLevels.includes(wizardData.readingLevel)) {
      throw new Error(
        'Invalid reading level. Must be beginner, intermediate, or advanced.'
      );
    }

    // Validate length
    const validLengths = [5, 10, 15];
    if (!validLengths.includes(wizardData.length)) {
      throw new Error('Invalid length. Must be 5, 10, or 15.');
    }

    // --- MAP WIZARD DATA TO GENERATOR PROMPT ---
    const storyPromptForGenerator: GeneratorStoryPrompt = {
      character: {
        name: wizardData.character.name,
        age: String(wizardData.character.age), // Convert number age to string
        gender: wizardData.character.gender, // Optional
        traits: wizardData.character.traits,
        // appearance: wizardData.character.appearance, // Omit for now
      },
      setting: wizardData.setting,
      theme: wizardData.theme,
      targetAge: ageNum, // Use the validated number age
      readingLevel: wizardData.readingLevel,
      durationMinutes: wizardData.length, // Map UI length to durationMinutes
      language: 'en', // Defaulting to English for now, omit if not needed by generator
      // Omit other optional fields not collected by UI:
      // style: wizardData.style,
      // educationalFocus: wizardData.educationalFocus,
    };

    console.log(
      '[Story API] Mapped prompt for generator:',
      JSON.stringify(storyPromptForGenerator, null, 2)
    );

    // --- CALL GENERATOR --- (Using the mapped prompt)
    const generatedStoryData = await generateStory(storyPromptForGenerator);

    if (!generatedStoryData.title || !generatedStoryData.content) {
      throw new Error('Failed to generate story content or title from AI');
    }

    // --- SAVE TO DATABASE --- (Using validated wizardData and generatedStoryData)
    console.log('[Story API] Inserting story with user_id:', user.id);
    const { data: savedStory, error: saveError } = await supabase
      .from('stories')
      .insert([
        {
          user_id: user.id, // Use authenticated user ID
          title: generatedStoryData.title,
          content: generatedStoryData.content,
          // Store original wizard inputs in the DB columns if needed
          character: wizardData.character,
          setting: wizardData.setting,
          theme: wizardData.theme,
          length: wizardData.length, // Store original length choice
          readingLevel: wizardData.readingLevel, // Use camelCase column name
          // Provide default values for required columns not yet in UI
          language: wizardData.language || 'en', // Provide default
          style: wizardData.style || 'general', // Provide default
          created_at: new Date().toISOString(),
          // Add other fields from generatedStoryData if schema allows/requires (e.g., plot_elements?)
        },
      ])
      .select()
      .single();

    if (saveError) {
      console.error('[Story API] Error saving story:', saveError);
      return new Response(
        JSON.stringify({
          error: 'Failed to save story to database',
          details: saveError.message, // Return only the message
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('[Story API] Story saved successfully:', savedStory.id);
    return new Response(JSON.stringify(savedStory), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('[Story API] Error in POST handler:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'An unexpected error occurred';
    // Avoid leaking internal details in production errors
    const clientError =
      errorMessage.startsWith('Missing') || errorMessage.startsWith('Invalid')
        ? errorMessage
        : 'Story generation failed.';

    return new Response(JSON.stringify({ error: clientError }), {
      status:
        error instanceof Error &&
        (errorMessage.startsWith('Missing') ||
          errorMessage.startsWith('Invalid'))
          ? 400
          : 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// --- (Other helper functions for branching, parsing, etc. can be copied here if needed) ---
