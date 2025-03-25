import { NextRequest } from 'next/server';

// In-memory storage for demo purposes
// TODO: Replace with database storage
const favoriteStories = new Set<string>();

export async function GET(request: NextRequest) {
  try {
    const storyId = request.nextUrl.pathname.split('/').pop();
    if (!storyId) {
      return new Response(JSON.stringify({ error: 'Story ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(
      JSON.stringify({ isFavorite: favoriteStories.has(storyId) }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to get favorite status' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const storyId = request.nextUrl.pathname.split('/').pop();
    if (!storyId) {
      return new Response(JSON.stringify({ error: 'Story ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { isFavorite } = await request.json();

    if (isFavorite) {
      favoriteStories.add(storyId);
    } else {
      favoriteStories.delete(storyId);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to update favorite status' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
