import { type NextRequest, NextResponse } from "next/server"
import { v4 as uuidv4 } from "uuid"

// In a real app, this would connect to a database
// For now, we'll simulate with an in-memory store
const stories: any[] = []

export async function GET(request: NextRequest) {
  try {
    // In a real app, you would fetch from a database
    // and include authentication/authorization checks

    // Get user ID from session (simulated)
    const userId = request.headers.get("x-user-id") || "demo-user"

    // Filter stories by user ID
    const userStories = stories.filter((story) => story.userId === userId)

    return NextResponse.json(userStories)
  } catch (error) {
    console.error("Error fetching stories:", error)
    return NextResponse.json({ error: "Failed to fetch stories" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.mainCharacter?.name) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get user ID from session (simulated)
    const userId = request.headers.get("x-user-id") || "demo-user"

    // Create new story
    const newStory = {
      id: uuidv4(),
      userId,
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Save to database (simulated)
    stories.push(newStory)

    return NextResponse.json(newStory, { status: 201 })
  } catch (error) {
    console.error("Error creating story:", error)
    return NextResponse.json({ error: "Failed to create story" }, { status: 500 })
  }
}

