import { type NextRequest, NextResponse } from "next/server"

// In a real app, this would connect to a database
// For now, we'll simulate with an in-memory store
// This references the same array as in the main route.ts
// In a real app, you'd use a database
const stories: any[] = []

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Get user ID from session (simulated)
    const userId = request.headers.get("x-user-id") || "demo-user"

    // Find story by ID and verify ownership
    const story = stories.find((s) => s.id === id && s.userId === userId)

    if (!story) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }

    return NextResponse.json(story)
  } catch (error) {
    console.error("Error fetching story:", error)
    return NextResponse.json({ error: "Failed to fetch story" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()

    // Get user ID from session (simulated)
    const userId = request.headers.get("x-user-id") || "demo-user"

    // Find story index
    const storyIndex = stories.findIndex((s) => s.id === id && s.userId === userId)

    if (storyIndex === -1) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }

    // Update story
    const updatedStory = {
      ...stories[storyIndex],
      ...body,
      id, // Ensure ID doesn't change
      userId, // Ensure userId doesn't change
      updatedAt: new Date().toISOString(),
    }

    stories[storyIndex] = updatedStory

    return NextResponse.json(updatedStory)
  } catch (error) {
    console.error("Error updating story:", error)
    return NextResponse.json({ error: "Failed to update story" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Get user ID from session (simulated)
    const userId = request.headers.get("x-user-id") || "demo-user"

    // Find story index
    const storyIndex = stories.findIndex((s) => s.id === id && s.userId === userId)

    if (storyIndex === -1) {
      return NextResponse.json({ error: "Story not found" }, { status: 404 })
    }

    // Remove story
    stories.splice(storyIndex, 1)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting story:", error)
    return NextResponse.json({ error: "Failed to delete story" }, { status: 500 })
  }
}

