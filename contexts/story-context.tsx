'use client';

import type React from 'react';
import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import type { StoryData } from '@/components/story/common/types';
import { generateStoryIllustrations } from '@/lib/image-generation';

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

export type Story = {
  storyData: StoryData;
  id?: string;
  title: string;
  mainCharacter: {
    name: string;
    age: string;
    traits: string[];
    appearance: string;
  };
  setting: string;
  theme: string;
  plotElements: string[];
  content?: string;
  illustrations?: {
    url: string;
    prompt: string;
    scene: string;
  }[];
  branches?: {
    [key: string]: StoryBranch;
  };
  currentBranchId?: string;
  createdAt?: string;
  updatedAt?: string;
  author?: string;
};

type StoryState = {
  stories: Story[];
  currentStory: Story | null;
  isLoading: boolean;
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
  isLoading: false,
  error: null,
};

// Create reducer
const storyReducer = (state: StoryState, action: StoryAction): StoryState => {
  switch (action.type) {
    case 'SET_STORIES':
      return { ...state, stories: action.payload, isLoading: false };
    case 'SET_CURRENT_STORY':
      return { ...state, currentStory: action.payload, isLoading: false };
    case 'CLEAR_CURRENT_STORY':
      return { ...state, currentStory: null };
    case 'ADD_STORY':
      return {
        ...state,
        stories: [...state.stories, action.payload],
        currentStory: action.payload,
        isLoading: false,
      };
    case 'UPDATE_STORY':
      return {
        ...state,
        stories: state.stories.map((story) =>
          story.id === action.payload.id ? action.payload : story
        ),
        currentStory: action.payload,
        isLoading: false,
      };
    case 'DELETE_STORY':
      return {
        ...state,
        stories: state.stories.filter((story) => story.id !== action.payload),
        currentStory:
          state.currentStory?.id === action.payload ? null : state.currentStory,
        isLoading: false,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    default:
      return state;
  }
};

// Create context
const StoryContext = createContext<{
  state: StoryState;
  dispatch: React.Dispatch<StoryAction>;
  fetchStories: () => Promise<void>;
  fetchStory: (id: string) => Promise<void>;
  createStory: (story: Story) => Promise<Story>;
  updateStory: (id: string, updates: Partial<Story>) => Promise<Story>;
  deleteStory: (id: string) => Promise<void>;
  generateStoryContent: (storyData: Story) => Promise<string>;
}>({
  state: initialState,
  dispatch: () => null,
  fetchStories: async () => {},
  fetchStory: async () => {},
  createStory: async () => ({} as Story),
  updateStory: async () => ({} as Story),
  deleteStory: async () => {},
  generateStoryContent: async () => '',
});

// Create provider
export const StoryProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(storyReducer, initialState);

  // Load stories from localStorage on initial render (client-side only)
  useEffect(() => {
    let isMounted = true;

    const loadStoriesFromLocalStorage = () => {
      try {
        // Only run on client side
        if (typeof window !== 'undefined') {
          const savedStories = localStorage.getItem('stories');
          if (savedStories && isMounted) {
            dispatch({
              type: 'SET_STORIES',
              payload: JSON.parse(savedStories),
            });
          }
        }
      } catch (error) {
        console.error('Error loading stories from localStorage:', error);
      }
    };

    loadStoriesFromLocalStorage();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, []);

  // Save stories to localStorage whenever they change
  useEffect(() => {
    if (state.stories.length > 0 && typeof window !== 'undefined') {
      localStorage.setItem('stories', JSON.stringify(state.stories));
    }
  }, [state.stories]);

  // API functions
  const fetchStories = useCallback(async () => {
    // Don't set loading state if already loading to prevent additional renders
    if (!state.isLoading) {
      dispatch({ type: 'SET_LOADING', payload: true });
    }
    dispatch({ type: 'SET_ERROR', payload: null }); // Clear previous errors

    try {
      const response = await fetch('/api/stories', {
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to fetch stories: ${response.status}`
        );
      }

      const stories = await response.json();
      dispatch({ type: 'SET_STORIES', payload: stories });
    } catch (error) {
      console.error('Error fetching stories:', error);
      dispatch({
        type: 'SET_ERROR',
        payload:
          error instanceof Error ? error.message : 'Failed to fetch stories',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [state.isLoading]);

  const fetchStory = useCallback(
    async (id: string) => {
      if (!state.isLoading) {
        dispatch({ type: 'SET_LOADING', payload: true });
      }
      dispatch({ type: 'SET_ERROR', payload: null });

      try {
        const response = await fetch(`/api/stories/${id}`, {
          credentials: 'include',
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
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
    [state.isLoading]
  );

  const createStory = async (story: Story) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const response = await fetch('/api/stories', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(story),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Failed to create story: ${response.status}`
        );
      }

      const newStory = await response.json();
      dispatch({ type: 'ADD_STORY', payload: newStory });
      return newStory;
    } catch (error) {
      console.error('Error creating story:', error);
      dispatch({
        type: 'SET_ERROR',
        payload:
          error instanceof Error ? error.message : 'Failed to create story',
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
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

  const generateStoryContent = async (storyData: Story) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null }); // Clear previous errors

    try {
      // Generate story text
      const response = await fetch('/api/generate-story', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storyData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to generate story: ${response.status}`
        );
      }

      const data = await response.json();
      const storyContent = data.content;

      // Generate illustrations for the story
      const illustrations = await generateStoryIllustrations({
        ...storyData,
        content: storyContent,
      });

      // Update the story with both content and illustrations
      const updatedStory = {
        ...storyData,
        content: storyContent,
        illustrations,
      };

      // If the story has an ID, update it in the database
      if (storyData.id) {
        await updateStory(storyData.id, updatedStory);
      }

      return storyContent;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      console.error('Error generating story:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
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
