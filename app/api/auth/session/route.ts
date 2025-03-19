import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    // Get session token from cookies
    const sessionToken = cookies().get("session-token")?.value

    if (!sessionToken) {
      return NextResponse.json({ user: null })
    }

    // In a real app, you would validate the session token against your database
    // and retrieve the associated user

    // For demo purposes, we'll simulate a valid session if the token exists
    if (sessionToken.startsWith("demo-token-")) {
      const user = {
        id: "user-1",
        name: "Demo User",
        email: "user@example.com",
        role: "user",
      }

      return NextResponse.json({ user })
    }

    return NextResponse.json({ user: null })
  } catch (error) {
    console.error("Session check error:", error)
    return NextResponse.json({ error: "Session check failed" }, { status: 500 })
  }
}

