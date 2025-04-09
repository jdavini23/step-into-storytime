import { useEffect, useCallback, Dispatch } from 'react';
import {
  AuthChangeEvent,
  Session,
  AuthError,
  PostgrestError,
} from '@supabase/supabase-js';
import {
  getSupabaseClient,
  getUserProfile,
  createUserProfile,
} from '@/services/authService';
import { User, UserProfile, AuthAction } from '@/types/auth';

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
        console.error(`406 Not Acceptable error for ${user.id}. Attempting to create profile...`);
        const { profile: newProfile, error: createError } =
          await createUserProfile(user);

        if (createError) {
          console.error('Profile creation error after 406:', createError);
          throw createError;
        }
        console.log(`Profile created for ${user.id} after 406 error`);
        return newProfile;
      } 
      else {
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
  isContextInitialized: boolean // Pass initialization status
) => {
  const supabase = getSupabaseClient();

  // Define initializeAuth within the hook's scope or pass as arg if needed elsewhere
  const initializeAuth = useCallback(
    async (sessionUser: User) => {
      console.log('useAuthListener: Initializing auth from event');
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_INITIALIZING', payload: true });
      try {
        const profile = await fetchOrCreateUserProfile(sessionUser);
        dispatch({
          type: 'INITIALIZE', // Or LOGIN_SUCCESS if appropriate after listener event
          payload: { user: sessionUser, profile },
        });
        console.log(
          'useAuthListener: Auth initialized successfully from event'
        );
      } catch (error) {
        console.error(
          'useAuthListener: Auth initialization error from event:',
          error
        );
        dispatch({
          type: 'INITIALIZE',
          payload: { user: null, profile: null },
        });
      }
    },
    [dispatch]
  );

  useEffect(() => {
    console.log('[DEBUG] Setting up auth listener');
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) {
          console.log('[DEBUG] Auth state changed but component unmounted');
          return;
        }

        console.log('[DEBUG] Auth state changed:', {
          event,
          hasSession: !!session,
          timestamp: new Date().toISOString(),
          isContextInitialized,
        });

        if (!session) {
          if (event !== 'SIGNED_OUT') {
            console.log('[DEBUG] No session, but event is not SIGNED_OUT');
          }
          dispatch({ type: 'LOGOUT' });
          return;
        }

        const user = session.user as User;

        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            console.log('[DEBUG] User signed in, initializing auth');
            await initializeAuth(user);
            break;
          case 'TOKEN_REFRESHED':
            console.log('[DEBUG] Token refreshed, updating session');
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user, profile: null },
            });
            break;
          case 'USER_UPDATED':
            console.log('[DEBUG] User updated, reinitializing auth');
            await initializeAuth(user);
            break;
          default:
            console.log('[DEBUG] Unhandled auth event:', event);
            break;
        }
      }
    );

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        console.log('[DEBUG] Found existing session, initializing auth');
        initializeAuth(session.user as User);
      } else {
        console.log('[DEBUG] No existing session found');
        dispatch({ type: 'LOGOUT' });
      }
    });

    return () => {
      mounted = false;
      console.log('[DEBUG] Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, [supabase, dispatch, initializeAuth, isContextInitialized]);
};
