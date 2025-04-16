import { OpenAI } from "openai";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { Story, StoryPrompt, StoryBranch } from "@/lib/types";

// Initialize OpenAI client with API key from environment variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Remove edge runtime config
// export const runtime = 'edge';
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    console.log("Starting story generation...");

    const supabase = await createServerSupabaseClient();
    console.log("Supabase client created");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log("User auth checked:", { userId: user?.id });

    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    console.log("Request body:", JSON.stringify(body, null, 2));

    if (!body.prompt) {
      console.error("No prompt in request body");
      return new Response(JSON.stringify({ error: "No prompt provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { prompt }: { prompt: StoryPrompt } = body;
    console.log("Prompt extracted:", JSON.stringify(prompt, null, 2));

    // Validate required prompt fields
    if (!prompt.character?.name || !prompt.setting || !prompt.theme) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields in prompt",
          details: "Character name, setting, and theme are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Generate story content using OpenAI
    console.log("Calling OpenAI API...");
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content:
            "You are a creative children's story writer. Write engaging, age-appropriate stories that are fun and educational.",
        },
        {
          role: "user",
          content: `Write a children's story with the following details:\n- Main character: ${prompt.character.name}, age ${
            prompt.character.age || 8
          }\n- Gender: ${prompt.character.gender || "Male"}\n- Character traits: ${
            prompt.character.traits?.join(", ") || "friendly"
          }\n- Setting: ${prompt.setting}\n- Theme: ${prompt.theme}\n- Length: ${prompt.length || 10} minutes\n- Reading level: ${
            prompt.readingLevel || "beginner"
          }\n- Language: ${prompt.language === "es" ? "Spanish" : "English"}\n- Style: ${
            prompt.style || "bedtime"
          }\n\nThe story should be engaging, age-appropriate, and divided into paragraphs.`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });
    console.log("OpenAI API response received");

    const storyContent = completion.choices[0].message.content;
    if (!storyContent) {
      throw new Error("Failed to generate story content");
    }

    // Split content into paragraphs
    const paragraphs = storyContent
      .split("\n")
      .filter((p) => p.trim().length > 0);

    // Create story object
    const story: Story = {
      user_id: user.id,
      character: {
        name: prompt.character.name,
        age: Number(prompt.character.age || 8),
        traits: prompt.character.traits || ["friendly"],
        gender: prompt.character.gender || "Male",
      },
      setting: prompt.setting,
      theme: prompt.theme,
      length: prompt.length || 10,
      readingLevel: prompt.readingLevel || "beginner",
      language: prompt.language === "es" ? "Spanish" : "English",
      style: prompt.style || "bedtime",
      content: paragraphs,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    console.log("Story object created");

    // Save story to database
    console.log("Saving to database...");
    const { error } = await supabase.from("stories").insert(story);

    if (error) {
      console.error("Database error:", error);
      throw error;
    }
    console.log("Story saved successfully");

    return new Response(JSON.stringify(story), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error generating story:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to generate story",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// --- (Other helper functions for branching, parsing, etc. can be copied here if needed) ---
