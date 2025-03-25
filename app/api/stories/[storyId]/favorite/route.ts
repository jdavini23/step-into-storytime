import { type NextRequest } from 'next/server';

// In-memory storage for demo purposes
// TODO: Replace with database storage
const favoriteStories = new Set<string>();

export async function PUT(
  request: NextRequest,
  { params }: { params: { storyId: string } }
): Promise<Response> {
  try {
    const { storyId } = params;
    const { isFavorite } = await request.json();

    if (isFavorite) {
      favoriteStories.add(storyId);
    } else {
      favoriteStories.delete(storyId);
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json(
      { error: 'Failed to update favorite status' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { storyId: string } }
): Promise<Response> {
  try {
    const { storyId } = params;
    return Response.json({ isFavorite: favoriteStories.has(storyId) });
  } catch (error) {
    return Response.json(
      { error: 'Failed to get favorite status' },
      { status: 500 }
    );
  }
}
