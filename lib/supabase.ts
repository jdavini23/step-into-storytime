import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// Type for Supabase instance with all tables
export type TypedSupabaseClient = SupabaseClient<Database>

// Environment variables for Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Missing Supabase environment variables. Authentication and database features may not work correctly.",
    "Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.",
  )
}

// Initialize Supabase client
export const supabase = createClient<Database>(supabaseUrl || "", supabaseAnonKey || "")

// Helper function to create a Supabase client for server components
export const createServerSupabaseClient = () => {
  return createClient<Database>(supabaseUrl || "", supabaseAnonKey || "", {
    auth: {
      persistSession: false,
    },
  })
}

// User authentication helpers
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function signUpWithEmail(email: string, password: string, userData?: Record<string, any>) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()

  if (error) {
    throw new Error(error.message)
  }

  return true
}

// Session management
export async function getSession() {
  const { data, error } = await supabase.auth.getSession()

  if (error) {
    throw new Error(error.message)
  }

  return data.session
}

export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw new Error(error.message)
  }

  return user
}

// Data fetching helpers
export async function fetchUserProfile(userId: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()

  if (error) {
    if (error.code === "PGRST116") {
      return null // No profile found
    }
    throw new Error(error.message)
  }

  return data
}

export async function updateUserProfile(userId: string, profileData: Record<string, any>) {
  const { data, error } = await supabase.from("profiles").update(profileData).eq("id", userId).select().single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// Subscription management
export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*, subscription_items(*)")
    .eq("user_id", userId)
    .single()

  if (error) {
    if (error.code === "PGRST116") {
      return null // No subscription found
    }
    throw new Error(error.message)
  }

  return data
}

// Story management
export async function fetchStories(userId: string) {
  const { data, error } = await supabase
    .from("stories")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data || []
}

export async function fetchStory(storyId: string, userId: string) {
  const { data, error } = await supabase.from("stories").select("*").eq("id", storyId).eq("user_id", userId).single()

  if (error) {
    if (error.code === "PGRST116") {
      return null // Story not found
    }
    throw new Error(error.message)
  }

  return data
}

export async function createStory(storyData: Record<string, any>, userId: string) {
  const { data, error } = await supabase
    .from("stories")
    .insert([{ ...storyData, user_id: userId }])
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function updateStory(storyId: string, storyData: Record<string, any>, userId: string) {
  const { data, error } = await supabase
    .from("stories")
    .update(storyData)
    .eq("id", storyId)
    .eq("user_id", userId) // Security: ensure user owns the story
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function deleteStory(storyId: string, userId: string) {
  const { error } = await supabase.from("stories").delete().eq("id", storyId).eq("user_id", userId) // Security: ensure user owns the story

  if (error) {
    throw new Error(error.message)
  }

  return true
}

