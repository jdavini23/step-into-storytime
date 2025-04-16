'use client';

import type React from 'react';
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useState,
  useMemo,
} from 'react';
import type { Story } from '@/lib/types';
import { generateStoryIllustrations } from '@/lib/image-generation';
import { useAuth } from '@/contexts/auth-context';
import { fetchWithAuth } from '@/lib/api';

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
  const [hasInitialFetch, setHasInitialFetch] = useState(false);

  // Initial data fetch - only runs once when authenticated
  useEffect(() => {
    const fetchInitialData = async () => {
      // Skip if already fetched or not authenticated
      if (
        hasInitialFetch ||
        !authState.isAuthenticated ||
        !authState.user?.id
      ) {
        if (!authState.isAuthenticated) {
          console.log(
            '[Story] User not authenticated, skipping initial story fetch.'
          );
        }
        dispatch({ type: 'SET_LOADING', payload: false });
        return;
      }

      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const { data, error } = await supabase
          .from('stories')
          .select('*')
          .eq('user_id', authState.user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[Story] Error fetching stories:', error);
          dispatch({ type: 'SET_ERROR', payload: 'Failed to load stories' });
        } else {
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
        setHasInitialFetch(true);
      }
    };

    fetchInitialData();
  }, [
    authState.isAuthenticated,
    authState.user?.id,
    hasInitialFetch,
    supabase,
  ]);

  // Remove localStorage effect as it's causing unnecessary re-renders
  // We'll handle persistence in the API layer instead

  const fetchStories = useCallback(async () => {
    if (!authState.isAuthenticated || !authState.user?.id) {
      console.log('[Story] User not authenticated, cannot fetch stories.');
      return;
    }

    if (state.loading) {
      console.log('[Story] Already loading stories, skipping fetch.');
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const { data, error } = await supabase
        .from('stories')
        .select('*')
        .eq('user_id', authState.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      dispatch({ type: 'SET_STORIES', payload: data || [] });
    } catch (error) {
      console.error('[Story] Error fetching stories:', error);
      dispatch({
        type: 'SET_ERROR',
        payload:
          error instanceof Error ? error.message : 'Failed to fetch stories',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [authState.isAuthenticated, authState.user?.id, state.loading, supabase]);

  const fetchStory = useCallback(
    async (id: string) => {
      if (state.loading) {
        return;
      }

      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        const { data: story, error } = await supabase
          .from('stories')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;

        dispatch({ type: 'SET_CURRENT_STORY', payload: story });
      } catch (error) {
        console.error('[Story] Error fetching story:', error);
        dispatch({
          type: 'SET_ERROR',
          payload:
            error instanceof Error ? error.message : 'Failed to fetch story',
        });
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [state.loading, supabase]
  );

  const createStory = useCallback(
    async (storyData: Story): Promise<Story> => {
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        const { data: story, error } = await supabase
          .from('stories')
          .insert([storyData])
          .select()
          .single();

        if (error) throw error;

        dispatch({ type: 'ADD_STORY', payload: story });
        return story;
      } catch (error) {
        console.error('[Story] Error creating story:', error);
        dispatch({
          type: 'SET_ERROR',
          payload:
            error instanceof Error ? error.message : 'Failed to create story',
        });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [supabase]
  );

  const updateStory = useCallback(
    async (id: string, updates: Partial<Story>) => {
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        const { data: story, error } = await supabase
          .from('stories')
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;

        dispatch({ type: 'UPDATE_STORY', payload: story });
        return story;
      } catch (error) {
        console.error('[Story] Error updating story:', error);
        dispatch({
          type: 'SET_ERROR',
          payload:
            error instanceof Error ? error.message : 'Failed to update story',
        });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [supabase]
  );

  const deleteStory = useCallback(
    async (id: string) => {
      dispatch({ type: 'SET_LOADING', payload: true });

      try {
        const { error } = await supabase.from('stories').delete().eq('id', id);

        if (error) throw error;

        dispatch({ type: 'DELETE_STORY', payload: id });
      } catch (error) {
        console.error('[Story] Error deleting story:', error);
        dispatch({
          type: 'SET_ERROR',
          payload:
            error instanceof Error ? error.message : 'Failed to delete story',
        });
        throw error;
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    },
    [supabase]
  );

  const generateStoryContent = useCallback(
    async (storyData: Story): Promise<{ en: string[]; es: string[] }> => {
      try {
        const prompt = {
          ...storyData,
          character: {
            name: storyData.character?.name || '',
            age: storyData.character?.age || 8,
            traits: storyData.character?.traits || ['friendly'],
            appearance: storyData.character?.appearance || '',
            gender: storyData.character?.gender || 'Male',
          },
        };
        const response = await fetch('/api/story/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ prompt }),
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
        console.error('[Story] Error generating story content:', error);
        throw error;
      }
    },
    []
  );

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      state,
      dispatch,
      fetchStories,
      fetchStory,
      createStory,
      updateStory,
      deleteStory,
      generateStoryContent,
    }),
    [
      state,
      fetchStories,
      fetchStory,
      createStory,
      updateStory,
      deleteStory,
      generateStoryContent,
    ]
  );

  return (
    <StoryContext.Provider value={contextValue}>
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
