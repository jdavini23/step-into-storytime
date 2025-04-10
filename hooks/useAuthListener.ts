import { useEffect, useCallback, Dispatch, useRef } from 'react';
import {
  AuthChangeEvent,
  Session,
  AuthError,
  PostgrestError,
} from '@supabase/supabase-js';
import { getUserProfile, createUserProfile } from '@/services/authService';
import { User, UserProfile, AuthAction } from '@/types/auth';
import supabase from '@/lib/supabase/client';

// Helper function adapted from auth-context (consider centralizing later)
const fetchOrCreateUserProfile = async (
  user: User
): Promise<UserProfile | null> => {
  try {
    const {
      profile,
      error: profileError,
    }: { profile: UserProfile | null; error: PostgrestError | null } =
      await getUserProfile(user.id);

    if (profileError) {
      // Handle 'not found' error
      if (profileError.code === 'PGRST116') {
        console.log(`Profile not found for ${user.id}. Creating...`);
        const { profile: newProfile, error: createError } =
          await createUserProfile(user);

        if (createError) {
          console.error('Profile creation error:', createError);
          throw createError;
        }
        console.log(`Profile created for ${user.id}`);
        return newProfile;
      }
      // Handle 406 Not Acceptable error
      else if (profileError.code === '406') {
        console.error(
          `406 Not Acceptable error for ${user.id}. Attempting to create profile...`
        );
        const { profile: newProfile, error: createError } =
          await createUserProfile(user);

        if (createError) {
          console.error('Profile creation error after 406:', createError);
          throw createError;
        }
        console.log(`Profile created for ${user.id} after 406 error`);
        return newProfile;
      } else {
        console.error('Profile fetch error:', profileError);
        throw profileError;
      }
    } else {
      console.log(`Profile fetched for ${user.id}`);
      return profile;
    }
  } catch (error) {
    console.error(
      'Profile operation error in fetchOrCreateUserProfile:',
      error
    );
    return null;
  }
};

export const useAuthListener = (
  dispatch: Dispatch<AuthAction>,
  isContextInitialized: boolean
) => {
  const hasInitializedRef = useRef(false);
  const supabaseClient = supabase();

  // Define initializeAuth within the hook's scope or pass as arg if needed elsewhere
  const initializeAuth = useCallback(
    async (sessionUser: User) => {
      const initId = Math.random().toString(36).substring(7);
      console.log(`[DEBUG][${initId}] Starting auth initialization`);
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_INITIALIZING', payload: true });
      try {
        console.log(`[DEBUG][${initId}] Fetching user profile`);
        const profile = await fetchOrCreateUserProfile(sessionUser);
        console.log(`[DEBUG][${initId}] Profile fetch complete:`, !!profile);

        dispatch({
          type: 'INITIALIZE',
          payload: { user: sessionUser, profile },
        });
        console.log(`[DEBUG][${initId}] Auth state initialized`);
      } catch (error) {
        console.error(`[DEBUG][${initId}] Auth initialization error:`, error);
        dispatch({
          type: 'INITIALIZE',
          payload: { user: null, profile: null },
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_INITIALIZING', payload: false });
        console.log(`[DEBUG][${initId}] Auth initialization complete`);
      }
    },
    [dispatch]
  );

  useEffect(() => {
    const effectId = Math.random().toString(36).substring(7);
    console.log(`[DEBUG][${effectId}] Setting up auth listener`);
    let mounted = true;

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) {
          console.log(
            `[DEBUG][${effectId}] Auth state changed but component unmounted`
          );
          return;
        }

        console.log(`[DEBUG][${effectId}] Auth state changed:`, {
          event,
          hasSession: !!session,
          timestamp: new Date().toISOString(),
          isContextInitialized,
          hasInitialized: hasInitializedRef.current,
          pathname:
            typeof window !== 'undefined'
              ? window.location.pathname
              : 'unknown',
        });

        if (!session) {
          if (event !== 'SIGNED_OUT') {
            console.log(
              `[DEBUG][${effectId}] No session, but event is not SIGNED_OUT`
            );
          }
          dispatch({ type: 'LOGOUT' });
          hasInitializedRef.current = false;
          return;
        }

        const user = session.user as User;

        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            console.log(
              `[DEBUG][${effectId}] User signed in, initializing auth`
            );
            hasInitializedRef.current = false; // Reset on new sign in
            await initializeAuth(user);
            hasInitializedRef.current = true;
            break;
          case 'TOKEN_REFRESHED':
            console.log(
              `[DEBUG][${effectId}] Token refreshed, updating session`
            );
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user, profile: null },
            });
            break;
          case 'USER_UPDATED':
            console.log(
              `[DEBUG][${effectId}] User updated, reinitializing auth`
            );
            await initializeAuth(user);
            break;
          case 'INITIAL_SESSION':
            if (!hasInitializedRef.current) {
              console.log(
                `[DEBUG][${effectId}] Initial session detected, handling auth state`
              );
              await initializeAuth(user);
              hasInitializedRef.current = true;
            } else {
              console.log(
                `[DEBUG][${effectId}] Skipping duplicate initialization`
              );
            }
            break;
          default:
            console.log(`[DEBUG][${effectId}] Unhandled auth event:`, event);
            break;
        }
      }
    );

    // Initial session check - only if not already initialized
    supabaseClient.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && !hasInitializedRef.current) {
        console.log(
          `[DEBUG][${effectId}] Found existing session, initializing auth`
        );
        initializeAuth(session.user as User);
        hasInitializedRef.current = true;
      } else if (!session) {
        console.log(`[DEBUG][${effectId}] No existing session found`);
        dispatch({ type: 'LOGOUT' });
        hasInitializedRef.current = false;
      }
    });

    return () => {
      mounted = false;
      console.log(`[DEBUG][${effectId}] Cleaning up auth listener`);
      subscription.unsubscribe();
    };
  }, [supabaseClient, dispatch, initializeAuth, isContextInitialized]);
};
