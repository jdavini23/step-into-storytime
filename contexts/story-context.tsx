"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, useCallback } from "react"

// Define types
type Story = {
  id?: string
  title: string
  mainCharacter: {
    name: string
    age: string
    traits: string[]
    appearance: string
  }
  setting: string
  theme: string
  plotElements: string[]
  content?: string
  createdAt?: string
  updatedAt?: string
}

type StoryState = {
  stories: Story[]
  currentStory: Story | null
  isLoading: boolean
  error: string | null
}

type StoryAction =
  | { type: "SET_STORIES"; payload: Story[] }
  | { type: "SET_CURRENT_STORY"; payload: Story }
  | { type: "CLEAR_CURRENT_STORY" }
  | { type: "ADD_STORY"; payload: Story }
  | { type: "UPDATE_STORY"; payload: Story }
  | { type: "DELETE_STORY"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }

// Create initial state
const initialState: StoryState = {
  stories: [],
  currentStory: null,
  isLoading: false,
  error: null,
}

// Create reducer
const storyReducer = (state: StoryState, action: StoryAction): StoryState => {
  switch (action.type) {
    case "SET_STORIES":
      return { ...state, stories: action.payload, isLoading: false }
    case "SET_CURRENT_STORY":
      return { ...state, currentStory: action.payload, isLoading: false }
    case "CLEAR_CURRENT_STORY":
      return { ...state, currentStory: null }
    case "ADD_STORY":
      return {
        ...state,
        stories: [...state.stories, action.payload],
        currentStory: action.payload,
        isLoading: false,
      }
    case "UPDATE_STORY":
      return {
        ...state,
        stories: state.stories.map((story) => (story.id === action.payload.id ? action.payload : story)),
        currentStory: action.payload,
        isLoading: false,
      }
    case "DELETE_STORY":
      return {
        ...state,
        stories: state.stories.filter((story) => story.id !== action.payload),
        currentStory: state.currentStory?.id === action.payload ? null : state.currentStory,
        isLoading: false,
      }
    case "SET_LOADING":
      return { ...state, isLoading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload, isLoading: false }
    default:
      return state
  }
}

// Create context
const StoryContext = createContext<{
  state: StoryState
  dispatch: React.Dispatch<StoryAction>
  fetchStories: () => Promise<void>
  fetchStory: (id: string) => Promise<void>
  createStory: (story: Story) => Promise<Story>
  updateStory: (story: Story) => Promise<Story>
  deleteStory: (id: string) => Promise<void>
  generateStoryContent: (storyData: Story) => Promise<string>
}>({
  state: initialState,
  dispatch: () => null,
  fetchStories: async () => {},
  fetchStory: async () => {},
  createStory: async () => ({}) as Story,
  updateStory: async () => ({}) as Story,
  deleteStory: async () => {},
  generateStoryContent: async () => "",
})

// Create provider
export const StoryProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(storyReducer, initialState)

  // Load stories from localStorage on initial render (client-side only)
  useEffect(() => {
    let isMounted = true

    const loadStoriesFromLocalStorage = () => {
      try {
        // Only run on client side
        if (typeof window !== "undefined") {
          const savedStories = localStorage.getItem("stories")
          if (savedStories && isMounted) {
            dispatch({ type: "SET_STORIES", payload: JSON.parse(savedStories) })
          }
        }
      } catch (error) {
        console.error("Error loading stories from localStorage:", error)
      }
    }

    loadStoriesFromLocalStorage()

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false
    }
  }, [])

  // Save stories to localStorage whenever they change
  useEffect(() => {
    if (state.stories.length > 0 && typeof window !== "undefined") {
      localStorage.setItem("stories", JSON.stringify(state.stories))
    }
  }, [state.stories])

  // API functions
  const fetchStories = async () => {
    // Don't set loading state if already loading to prevent additional renders
    if (!state.isLoading) {
      dispatch({ type: "SET_LOADING", payload: true })
    }
    dispatch({ type: "SET_ERROR", payload: null }) // Clear previous errors

    try {
      const response = await fetch("/api/stories")

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to fetch stories: ${response.status}`)
      }

      const data = await response.json()
      dispatch({ type: "SET_STORIES", payload: data })
      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      dispatch({ type: "SET_ERROR", payload: errorMessage })
      console.error("Error fetching stories:", error)
      // Return empty array to prevent undefined errors
      return []
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  const fetchStory = async (id: string) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const response = await fetch(`/api/stories/${id}`)
      if (!response.ok) throw new Error("Failed to fetch story")
      const data = await response.json()
      dispatch({ type: "SET_CURRENT_STORY", payload: data })
      return data
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: (error as Error).message })
      console.error("Error fetching story:", error)
      throw error
    }
  }

  const createStory = async (story: Story) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const response = await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(story),
      })
      if (!response.ok) throw new Error("Failed to create story")
      const data = await response.json()
      dispatch({ type: "ADD_STORY", payload: data })
      return data
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: (error as Error).message })
      console.error("Error creating story:", error)
      throw error
    }
  }

  const updateStory = async (story: Story) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const response = await fetch(`/api/stories/${story.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(story),
      })
      if (!response.ok) throw new Error("Failed to update story")
      const data = await response.json()
      dispatch({ type: "UPDATE_STORY", payload: data })
      return data
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: (error as Error).message })
      console.error("Error updating story:", error)
      throw error
    }
  }

  const deleteStory = async (id: string) => {
    dispatch({ type: "SET_LOADING", payload: true })
    try {
      const response = await fetch(`/api/stories/${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete story")
      dispatch({ type: "DELETE_STORY", payload: id })
    } catch (error) {
      dispatch({ type: "SET_ERROR", payload: (error as Error).message })
      console.error("Error deleting story:", error)
      throw error
    }
  }

  const generateStoryContent = async (storyData: Story) => {
    dispatch({ type: "SET_LOADING", payload: true })
    dispatch({ type: "SET_ERROR", payload: null }) // Clear previous errors

    try {
      const response = await fetch("/api/generate-story", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(storyData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || `Failed to generate story: ${response.status}`)
      }

      const data = await response.json()
      return data.content
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      dispatch({ type: "SET_ERROR", payload: errorMessage })
      console.error("Error generating story:", error)
      throw error
    } finally {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }

  // Add this near the top of the component, after the reducer
  const memoizedFetchStories = useCallback(fetchStories, [])

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
  )
}

// Create hook for using the context
export const useStory = () => {
  const context = useContext(StoryContext)
  if (!context) {
    throw new Error("useStory must be used within a StoryProvider")
  }
  return context
}

