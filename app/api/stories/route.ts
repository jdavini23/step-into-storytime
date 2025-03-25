import { NextRequest, NextResponse } from "next/server";
import { StoryData } from "@/components/story/common/types";
import type { Story } from "@/contexts/story-context";
import { createClient } from "@/utils/supabase/server";
import { createStory } from "@/lib/supabase/story-operations"; // Corrected import for createStory

// In-memory storage for demo purposes
// TODO: Replace with database storage
let stories: Story[] = [];

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const { data: stories, error } = await supabase
      .from("stories")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching stories:", error);
      return NextResponse.json(
        { error: "Failed to fetch stories" },
        { status: 500 }
      );
    }

    return NextResponse.json({ stories });
  } catch (error) {
    console.error("Unexpected error in GET /api/stories:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, res: any) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const json = await request.json();
    const story = await createStory(json, user.id);

    const { error } = await supabase.from("stories").insert({
      ...story,
      user_id: user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.error("Error saving story:", error);
      return NextResponse.json(
        { error: "Failed to save story" },
        { status: 500 }
      );
    }

    return NextResponse.json({ story });
  } catch (error) {
    console.error("Unexpected error in POST /api/stories:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { storyId: string } }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    // Verify story ownership
    const { data: existingStory } = await supabase
      .from("stories")
      .select("user_id")
      .eq("id", id)
      .single();

    if (!existingStory || existingStory.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized - Story not found or access denied" },
        { status: 403 }
      );
    }

    const { data: story, error } = await supabase
      .from("stories")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating story:", error);
      return NextResponse.json(
        { error: "Failed to update story" },
        { status: 500 }
      );
    }

    return NextResponse.json({ story });
  } catch (error) {
    console.error("Unexpected error in PUT /api/stories:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { storyId: string } }
) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized - Please sign in" },
        { status: 401 }
      );
    }

    const storyId = params.storyId;

    // Verify story ownership
    const { data: existingStory } = await supabase
      .from("stories")
      .select("user_id")
      .eq("id", storyId)
      .single();

    if (!existingStory || existingStory.user_id !== user.id) {
      return NextResponse.json(
        { error: "Unauthorized - Story not found or access denied" },
        { status: 403 }
      );
    }

    const { error } = await supabase.from("stories").delete().eq("id", storyId);

    if (error) {
      console.error("Error deleting story:", error);
      return NextResponse.json(
        { error: "Failed to delete story" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error in DELETE /api/stories:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
