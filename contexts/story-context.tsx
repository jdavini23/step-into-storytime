'use client';

import type React from 'react';
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import { Story } from '@/components/story/common/types';
import { generateStoryIllustrations } from '@/lib/image-generation';
import { useAuth } from '@/contexts/auth-context';

// Define types
export type StoryBranch = {
  id: string;
  content: string;
  choices: {
    text: string;
    nextBranchId: string;
  }[];
  illustration?: {
    url: string;
    prompt: string;
    scene: string;
  };
};

interface StoryContextType {
  state: StoryState;
  dispatch: React.Dispatch<StoryAction>;
  fetchStories: () => Promise<void>;
  fetchStory: (id: string) => Promise<void>;
  createStory: (story: Story) => Promise<Story>;
  updateStory: (id: string, updates: Partial<Story>) => Promise<Story>;
  deleteStory: (id: string) => Promise<void>;
  generateStoryContent: (
    storyData: Story
  ) => Promise<{ en: string[]; es: string[] }>;
}

type StoryState = {
  stories: Story[];
  currentStory: Story | null;
  loading: boolean;
  error: string | null;
};

type StoryAction =
  | { type: 'SET_STORIES'; payload: Story[] }
  | { type: 'SET_CURRENT_STORY'; payload: Story }
  | { type: 'CLEAR_CURRENT_STORY' }
  | { type: 'ADD_STORY'; payload: Story }
  | { type: 'UPDATE_STORY'; payload: Story }
  | { type: 'DELETE_STORY'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Create initial state
const initialState: StoryState = {
  stories: [],
  currentStory: null,
  loading: false,
  error: null,
};

// Create reducer
const storyReducer = (state: StoryState, action: StoryAction): StoryState => {
  switch (action.type) {
    case 'SET_STORIES':
      return { ...state, stories: action.payload, loading: false };
    case 'SET_CURRENT_STORY':
      return { ...state, currentStory: action.payload, loading: false };
    case 'CLEAR_CURRENT_STORY':
      return { ...state, currentStory: null };
    case 'ADD_STORY':
      return {
        ...state,
        stories: [...state.stories, action.payload],
        currentStory: action.payload,
        loading: false,
      };
    case 'UPDATE_STORY':
      return {
        ...state,
        stories: state.stories.map((story) =>
          story.id === action.payload.id ? action.payload : story
        ),
        currentStory: action.payload,
        loading: false,
      };
    case 'DELETE_STORY':
      return {
        ...state,
        stories: state.stories.filter((story) => story.id !== action.payload),
        currentStory:
          state.currentStory?.id === action.payload ? null : state.currentStory,
        loading: false,
      };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    default:
      return state;
  }
};

const StoryContext = createContext<StoryContextType>({
  state: initialState,
  dispatch: () => null,
  fetchStories: async () => {},
  fetchStory: async () => {},
  createStory: async () => ({} as Story),
  updateStory: async () => ({} as Story),
  deleteStory: async () => {},
  generateStoryContent: async () => ({ en: [], es: [] }),
});

// Create provider
export const StoryProvider = ({ children }: { children: React.ReactNode }) => {
  const { state: authState, supabase } = useAuth();
  const [state, dispatch] = useReducer(storyReducer, initialState);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!authState.isAuthenticated || !authState.user?.id) {
        console.log(
          '[Story] User not authenticated, skipping initial story fetch.'
        );
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }
      if (supabase && authState.user.id) {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
          console.log('[Story] Fetching stories for user:', authState.user.id);
          const { data, error } = await supabase
            .from('stories')
            .select('*')
            .eq('user_id', authState.user.id)
            .order('created_at', { ascending: false });

          if (error) {
            console.error('[Story] Error fetching stories:', error);
            dispatch({ type: 'SET_ERROR', payload: 'Failed to load stories' });
          } else {
            console.log('[Story] Stories fetched successfully:', data);
            dispatch({ type: 'SET_STORIES', payload: data || [] });
          }
        } catch (error) {
          console.error('[Story] Unexpected error fetching stories:', error);
          dispatch({
            type: 'SET_ERROR',
            payload: 'An unexpected error occurred while loading stories',
          });
        } finally {
          dispatch({ type: 'SET_LOADING', payload: false });
        }
      }
    };

    fetchInitialData();
  }, [supabase, authState.isAuthenticated, authState.user?.id]);

  // Save stories to localStorage whenever they change
  useEffect(() => {
    if (state.stories.length > 0 && typeof window !== 'undefined') {
      localStorage.setItem('stories', JSON.stringify(state.stories));
    }
  }, [state.stories]);

  // API functions
  const fetchStories = async () => {
    if (state.loading) return;
    dispatch({ type: 'SET_ERROR', payload: null });
    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      console.log('[DEBUG] Fetching stories...');

      // Get the current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        console.error('[DEBUG] No access token found in fetchStories');
        throw new Error('Authentication required');
      }

      console.log(
        '[DEBUG] Using access token:',
        session.access_token.substring(0, 10) + '...'
      );

      const response = await fetch('/api/stories', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-store',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      console.log('[DEBUG] Stories API response:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
      });

      if (response.status === 401) {
        console.error('[DEBUG] Authentication error in fetchStories');
        dispatch({ type: 'SET_STORIES', payload: [] });
        throw new Error('Authentication required');
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('[DEBUG] Error response from stories API:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData,
        });
        throw new Error(
          errorData.error ||
            `Failed to fetch stories: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log('[DEBUG] Stories data:', {
        count: data.stories?.length || 0,
        firstStoryId: data.stories?.[0]?.id,
      });

      dispatch({ type: 'SET_STORIES', payload: data.stories || [] });
    } catch (error) {
      console.error('[DEBUG] Error fetching stories:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
      });
      dispatch({
        type: 'SET_ERROR',
        payload:
          error instanceof Error ? error.message : 'Failed to fetch stories',
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const fetchStory = useCallback(
    async (id: string) => {
      if (!state.loading) {
        dispatch({ type: 'SET_LOADING', payload: true });
      }
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        const response = await fetch(`/api/stories/${id}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error('Story fetch error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorData,
          });
          throw new Error(
            errorData.error || `Failed to fetch story: ${response.status}`
          );
        }

        const story = await response.json();
        dispatch({ type: 'SET_CURRENT_STORY', payload: story });
      } catch (error) {
        console.error('Error fetching story:', error);
        dispatch({
          type: 'SET_ERROR',
          payload:
            error instanceof Error ? error.message : 'Failed to fetch story',
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [state.loading]
  );

  const createStory = async (storyData: Story): Promise<Story> => {
    try {
      const content = await generateStoryContent(storyData);
      const illustrations = await generateStoryIllustrations({
        ...storyData,
        content: {
          en: content.en,
          es: content.es,
        },
      });

      const response = await fetch('/api/stories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...storyData,
          content,
          illustrations: illustrations.map((ill) => ({
            url: ill.url,
            prompt: ill.prompt,
            scene: ill.scene,
          })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create story');
      }

      const story = await response.json();
      dispatch({ type: 'ADD_STORY', payload: story });
      return story;
    } catch (error) {
      console.error('Error creating story:', error);
      throw error;
    }
  };

  const updateStory = async (id: string, updates: Partial<Story>) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await fetch(`/api/stories/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to update story: ${response.status}`
        );
      }

      const updatedStory = await response.json();
      dispatch({ type: 'UPDATE_STORY', payload: updatedStory });
      return updatedStory;
    } catch (error) {
      console.error('Error updating story:', error);
      dispatch({
        type: 'SET_ERROR',
        payload:
          error instanceof Error ? error.message : 'Failed to update story',
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteStory = async (id: string) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await fetch(`/api/stories/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to delete story: ${response.status}`
        );
      }

      dispatch({ type: 'DELETE_STORY', payload: id });
    } catch (error) {
      console.error('Error deleting story:', error);
      dispatch({
        type: 'SET_ERROR',
        payload:
          error instanceof Error ? error.message : 'Failed to delete story',
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const generateStoryContent = async (
    storyData: Story
  ): Promise<{ en: string[]; es: string[] }> => {
    try {
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storyData),
      });

      if (!response.ok) {
        throw new Error('Failed to generate story content');
      }

      const data = await response.json();
      return {
        en: data.content.split('\n'),
        es: [],
      };
    } catch (error) {
      console.error('Error generating story content:', error);
      throw error;
    }
  };

  // Add this near the top of the component, after the reducer
  const memoizedFetchStories = useCallback(fetchStories, []);

  // Then in the return statement, use the memoized version
  return (
    <StoryContext.Provider
      value={{
        state,
        dispatch,
        fetchStories: memoizedFetchStories,
        fetchStory,
        createStory,
        updateStory,
        deleteStory,
        generateStoryContent,
      }}
    >
      {children}
    </StoryContext.Provider>
  );
};

// Create hook for using the context
export const useStory = () => {
  const context = useContext(StoryContext);
  if (!context) {
    throw new Error('useStory must be used within a StoryProvider');
  }
  return context;
};

export type { Story };
