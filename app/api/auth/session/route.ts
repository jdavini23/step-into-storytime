import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    // Get session token from cookies
    const sessionToken = cookies().get('session-token')?.value;

    if (!sessionToken) {
      return NextResponse.json({ user: null });
    }

    // In a real app, you would validate the session token against your database
    // and retrieve the associated user
    // For demo purposes, we'll just return a mock user
    return NextResponse.json({
      user = {
        id: '1',
        email: 'demo@example.com',
        name: 'Demo User',
      },
    });
  } catch (error) {
    console.error('Session error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
