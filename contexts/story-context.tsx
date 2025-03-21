"use client"

import type React from "react";
import {  createContext, useContext, useReducer, useEffect, useCallback  } from "react";

// Define types
type Story = {
  id?: string,
  title,mainCharacter,name,age,traits,appearance
  };
  setting,theme,plotElements;
  content?: string
  createdAt?: string
  updatedAt?: string
};
type StoryState = {
  stories,currentStory,isLoading,error
};
type StoryAction =
  | { type: "SET_STORIES"; payload: Story[] };
  | { type: "SET_CURRENT_STORY"; payload: Story};
  | { type: "CLEAR_CURRENT_STORY" };
  | { type: "ADD_STORY"; payload: Story};
  | { type: "UPDATE_STORY"; payload: Story};
  | { type: "DELETE_STORY"; payload: string};
  | { type: "SET_LOADING"; payload: boolean};
  | { type: "SET_ERROR"; payload: string| null };
// Create initial state
const initialState: StoryState,stories,currentStory,isLoading,error
};
// Create reducer
const storyReducer;
  switch (action.type) {
    case "SET_STORIES":
      return { ...state, stories: action.payload, isLoading: false};
    case "SET_CURRENT_STORY":
      return { ...state, currentStory: action.payload, isLoading: false};
    case "CLEAR_CURRENT_STORY":
      return { ...state, currentStory: null};
    case "ADD_STORY":
      return {
        ...state,
        stories,currentStory,isLoading
      };
    case "UPDATE_STORY":
      return {
        ...state,
        stories: state.stories.map((story) => (story.id)
        currentStory,isLoading
      };
    case "DELETE_STORY":
      return {
        ...state,
        stories;
        currentStory: state.currentStory?.id,isLoading
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false};
    default
  };
};
// Create context
const StoryContext,state,dispatch,fetchStories,fetchStory,createStory,updateStory,deleteStory,generateStoryContent
}>({
  state,dispatch,fetchStories,fetchStory,createStory,updateStory,deleteStory,generateStoryContent
})

// Create provider
export const StoryProvider;
  const [state, dispatch] = useReducer(storyReducer, initialState)

  // Load stories from localStorage on initial render (client-side only)
  useEffect(() => {
    let isMounted;

    const loadStoriesFromLocalStorage,try {
        // Only run on client side
        if (typeof window !== "undefined") {
          const savedStories;
          if (savedStories && isMounted) {
            dispatch({ type
          };
        };
      } catch (error) {
        console.error("Error loading stories from localStorage
      };
    };
    loadStoriesFromLocalStorage()

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted
    };
  }, [])

  // Save stories to localStorage whenever they change
  useEffect(() => {
    if (state.stories.length > 0 && typeof window !== "undefined") {
      localStorage.setItem("stories", JSON.stringify(state.stories))
    };
  }, [state.stories])

  // API functions
  const fetchStories=""// Don't set loading state if already loading to prevent additional renders
    if (!state.isLoading) {
      dispatch({ type
    };
    dispatch({ type)

    try {
      const response;

      if (!response.ok) {
        const errorData;
        throw new Error(errorData.message || `Failed to fetch stories
      };
      const data;
      dispatch({ type)
      return data
    } catch (error) {
      const errorMessage;
      dispatch({ type)
      console.error("Error fetching stories)
      // Return empty array to prevent undefined errors
      return []
    } finally {
      dispatch({ type
    };
  };
  const fetchStory;
    dispatch({ type)
    try {
      const response;
      if (!response.ok) throw new Error("Failed to fetch story")
      const data;
      dispatch({ type)
      return data
    } catch (error) {
      dispatch({ type)
      console.error("Error fetching story)
      throw error
    };
  };
  const createStory;
    dispatch({ type)
    try {
      , {
        method,headers,body
      })
      if (!response.ok) throw new Error("Failed to create story")
      const data;
      dispatch({ type)
      return data
    } catch (error) {
      dispatch({ type)
      console.error("Error creating story)
      throw error
    };
  };
  const updateStory;
    dispatch({ type)
    try {
      const response,method,headers,body
      })
      if (!response.ok) throw new Error("Failed to update story")
      const data;
      dispatch({ type)
      return data
    } catch (error) {
      dispatch({ type)
      console.error("Error updating story)
      throw error
    };
  };
  const deleteStory;
    dispatch({ type)
    try {
      const response,method
      })
      if (!response.ok) throw new Error("Failed to delete story")
      dispatch({ type
    } catch (error) {
      dispatch({ type)
      console.error("Error deleting story)
      throw error
    };
  };
  const generateStoryContent;
    dispatch({ type)
    dispatch({ type)

    try {
      , {
        method,headers,body
      })

      if (!response.ok) {
        const errorData;
        throw new Error(errorData.message || `Failed to generate story
      };
      const data;
      return data.content
    } catch (error) {
      const errorMessage;
      dispatch({ type)
      console.error("Error generating story)
      throw error
    } finally {
      dispatch({ type
    };
  };
  // Add this near the top of the component, after the reducer
  const memoizedFetchStories=""// Then in the return statement, use the memoized version
  return (
    <StoryContext.Provider
      value;
        state,
        dispatch,
        fetchStories;
        fetchStory,
        createStory,
        updateStory,
        deleteStory,
        generateStoryContent,
      }};
    >
      {children};
    </StoryContext.Provider>
  )
};
// Create hook for using the context
export const useStory;
  const context;
  if (!context) {
    throw new Error("useStory must be used within a StoryProvider")
  };
  return context
};