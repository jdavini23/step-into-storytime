import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // In a real app, you would validate credentials against a database
    // For demo purposes, we'll accept any login with password "password123"
    if (password !== "password123") {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Create a session
    const sessionToken = `demo-token-${Date.now()}`
    const user = {
      id: "user-1",
      name: email.split("@")[0],
      email,
      role: "user",
    }

    // Set session cookie
    cookies().set({
      name: "session-token",
      value: sessionToken,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 })
  }
}

