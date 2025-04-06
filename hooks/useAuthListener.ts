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
    console.log('Setting up auth listener');
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) {
          console.log('Auth state changed but component unmounted');
          return;
        }

        console.log('Auth state changed:', {
          event,
          hasSession: !!session,
          timestamp: new Date().toISOString(),
          isContextInitialized,
        });

        if (!session) {
          if (event !== 'SIGNED_OUT') {
            console.log(
              'No session, but event is not SIGNED_OUT. Potential issue or initial load?'
            );
          }
          dispatch({ type: 'LOGOUT' });
          return;
        }

        const user = session.user as User;

        switch (event) {
          case 'SIGNED_IN':
          case 'TOKEN_REFRESHED':
            // Typescript doesn't like the INITIAL_USER event, so this is removed
            // case 'INITIAL_USER': // Handle initial load event
            // Only initialize fully if the context isn't already initialized
            if (!isContextInitialized) {
              await initializeAuth(user);
            } else {
              // If already initialized, just ensure user/profile are up-to-date
              console.log(
                'Context already initialized, potentially updating user/profile'
              );
              // Fetch profile if needed, then dispatch LOGIN_SUCCESS or UPDATE_USER/PROFILE
              const profile = await fetchOrCreateUserProfile(user);
              dispatch({ type: 'LOGIN_SUCCESS', payload: { user, profile } });
            }
            break;
          case 'SIGNED_OUT':
            // This case is handled by the (!session) check above
            break;
          case 'USER_UPDATED':
            // Update user data without full reinitialization
            dispatch({ type: 'UPDATE_USER', payload: { user } });
            // Optionally refetch profile if relevant data might change
            const updatedProfile = await fetchOrCreateUserProfile(user);
            dispatch({ type: 'PROFILE_LOADED', payload: updatedProfile! });
            break;
          case 'PASSWORD_RECOVERY':
            // Handle password recovery state if needed (e.g., show specific UI)
            console.log('Password recovery event');
            break;
          // MFA_CHALLENGE is not a valid AuthChangeEvent
          // case 'MFA_CHALLENGE':
          //   console.log('MFA Challenge event');
          // Handle MFA challenge if needed
          //   break;
          default:
            console.log('Unhandled auth event:', event);
        }
      }
    );

    return () => {
      mounted = false;
      console.log('Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, [supabase, dispatch, initializeAuth, isContextInitialized]); // Add dependencies
};
