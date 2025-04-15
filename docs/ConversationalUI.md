# 🧭 Conversational Story Wizard – Flow Map

This document outlines the conversational UI flow for our Story Wizard, broken down into:

1. Conversation Stages (with example prompts and user input types)
2. System Logic (how to manage branching, saving, and nudging)
3. Optional Enhancements (for delight + engagement)
4. Next Steps: Prototyping the flow in code/UI

## 1. 🗺️ Conversation Stages

Each stage builds the story structure while keeping it fun and light.

| Step | Stage                | Assistant Prompt                                                             | Input Type                                                                      | Notes                                       |
| ---- | -------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------- |
| 1    | Welcome              | "Hi! Ready to create a magical bedtime story together?"                      | Button chips: Yes / Surprise Me / Not now                                       | Can show a fun animation or mascot          |
| 2    | Hero Creation        | "Who's the hero of our story?"                                               | Chips: 🐰 Rabbit / 🤖 Robot / 🐿️ Squirrel / Custom text input                   | Save as mainCharacter                       |
| 3    | Character Traits     | "Tell me more about them. Are they brave, curious, or a little mischievous?" | Multi-select chips + free text                                                  | Save as characterTraits                     |
| 4    | Setting              | "Where does this story take place?"                                          | Chips: Forest 🌳 / Space 🚀 / Underwater 🌊 / Custom                            | Save as setting                             |
| 5    | Supporting Character | "Want to add a sidekick or friend?"                                          | Optional – chips or skip                                                        | Save as supportingCharacter                 |
| 6    | Challenge/Conflict   | "What kind of challenge should they face?"                                   | Chips: Solve a mystery 🔍 / Rescue a friend 🛟 / Discover a treasure 💎 / Custom | Save as conflict                            |
| 7    | Mood & Tone          | "Should this story be silly, heartwarming, or a little spooky?"              | Chips: Silly 😂 / Heartwarming ❤️ / Spooky 👻                                   | Save as mood                                |
| 8    | Story Title          | "What should we call this story?"                                            | Text input or suggest 3 auto-generated titles                                   | Save as title                               |
| 9    | Generate Preview     | "Alright, here's your story loading..."                                      | Loading spinner / progress animation                                            | AI generates first draft                    |
| 10   | Edit / Continue      | "Want to edit anything or keep going?"                                       | Buttons: Edit / New Story / Save & Read                                         | Option to preview, customize, or regenerate |

## 2. ⚙️ System Logic

### 🎛️ State Management

Use a wizard state object to store values:

```typescript
{
  mainCharacter: "robot",
  characterTraits: ["curious", "kind"],
  setting: "space station",
  supportingCharacter: "parrot with a jetpack",
  conflict: "solve a mystery",
  mood: "silly",
  title: "The Curious Bot and the Cosmic Clue"
}
```

### 🤖 AI Prompt Generation

At Step 9, combine inputs into a well-structured prompt for GPT:

```text
Write a silly bedtime story titled "The Curious Bot and the Cosmic Clue."
The main character is a curious, kind robot.
They're on a space station and must solve a mystery with the help of a parrot with a jetpack.
```

### 💾 Auto Save & Continue

- Save state at every step (Supabase or localStorage)
- Allow users to come back and finish later
- Option to create a "Story Archive"

## 3. ✨ Optional Enhancements

| Feature                | Idea                                                  |
| ---------------------- | ----------------------------------------------------- |
| 🎤 Voice Prompts       | Let users speak inputs if on mobile                   |
| 🎨 Visual Aid          | Show mini icons of character + setting while chatting |
| 🧠 Smart Suggestions   | "Would you like me to suggest a fun conflict?"        |
| 📝 Story Preview Panel | Live updating preview next to or below chat           |
| 📚 Save to Library     | Add "Favorites" or "Storybook Mode" for bedtime reads |

## 4. Next Steps

1. Implement basic conversation flow in React
2. Add state management (Context or Redux)
3. Integrate with GPT API for story generation
4. Add visual enhancements and animations
5. Test with users and iterate based on feedback
