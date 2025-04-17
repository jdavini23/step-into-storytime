# Story Generation Improvement Plan

## Objective

Refine the story generation process in _Step Into Storytime_ to:

1.  Better align user inputs collected via the wizard UI with the AI prompt used by `utils/ai/story-generator.ts`.
2.  Provide independent user control over story **length (duration)** and **reading level (complexity)**.
3.  Prepare the system for future feature enhancements and subscription tiers by retaining optional fields in the prompt interface.

## Current State Analysis

### UI Inputs (`components/wizard-ui/`)

Based on analysis of `wizard-context.tsx` and step components (`CharacterStep.tsx`, `LengthStep.tsx`, etc.):

- **Character:** `name` (string), `age` (number 2-12), `gender` (string 'boy'/'girl'), `traits` (string[], including custom)
- **Setting:** `setting` (string)
- **Theme:** `theme` (string)
- **Length:** `length` (number: 5, 10, or 15 minutes) - Currently controls **duration**.

### Generator Prompt (`utils/ai/story-generator.ts`)

- Accepts a `StoryPrompt` object with fields like:
  - `character`: { `name`, `age` (string), `gender`, `traits`, `appearance`? }
  - `setting`
  - `theme`
  - `targetAge` (number)
  - `readingLevel` ('beginner', 'intermediate', 'advanced') - **Currently intended to control complexity.**
  - `language`?
  - `style`?
  - `educationalFocus`?
- The **`systemPrompt`** currently **links story length directly to `readingLevel`**, preventing independent control:
  ```
  // Example snippet from current systemPrompt:
     - Story length: ${
       prompt.readingLevel === 'beginner' ? '3-5' :
       prompt.readingLevel === 'intermediate' ? '5-7' :
       '7-10'
     } minutes reading time
  ```

### Key Discrepancies

1.  **Length vs. Complexity:** The UI collects desired _duration_ (`length`), but the generator uses `readingLevel` to control _both_ complexity _and_ duration, creating a conflict.
2.  **Missing UI Inputs:** The UI doesn't currently collect `character.appearance`, `language`, `style`, or `educationalFocus`, although the generator interface includes them.
3.  **Type Mismatch:** Minor mismatch `character.age` (UI number vs. generator string).

## Proposed Changes

### 1. UI Modifications (`components/wizard-ui/`)

- **Add Reading Level Input:**
  - Introduce a new input mechanism (e.g., buttons, dropdown) within the wizard flow.
  - This will allow users to explicitly select the desired complexity: 'Beginner', 'Intermediate', or 'Advanced'.
  - Update `WizardContext` and `WizardData` (consider making `WizardData` a defined type instead of `any`) to store this value (e.g., `data.readingLevel`).
  - Add validation for this new input.
- **Keep Length Input:**
  - `LengthStep.tsx` remains as is, collecting the desired duration (5, 10, or 15 minutes) and storing it in `data.length`.

### 2. Generator Modifications (`utils/ai/story-generator.ts`)

- **`StoryPrompt` Interface:**
  - ✅ Added `durationMinutes: number` field to the interface for explicit duration control.
  - ✅ Added validation for `durationMinutes` (3-20 minutes range, defaults to 5).
  - ✅ Updated system and user prompts to use `durationMinutes` directly.
- **`systemPrompt` Update:**
  - ✅ Decoupled Length: Removed the logic that sets story length based on `readingLevel`.
  - ✅ Use UI Length: Added a specific instruction using the user's chosen duration (passed into the prompt function). Example: `- Story length: Approximately ${prompt.durationMinutes || 5} minutes reading time.`
  - ✅ Use UI Reading Level: Continue using the `readingLevel` parameter (now explicitly chosen by the user) to guide complexity, vocabulary, sentence structure, etc. Example: `- Reading level: ${prompt.readingLevel}`.
  - ✅ Use Target Age: Continue using `targetAge` (derived from UI age) to ensure age-appropriateness.
- **Input Validation:**
  - ✅ Added validation within the `generateStory` function to check for valid `StoryPrompt` data before calling the AI API.

### 3. Data Mapping & Handling (In the calling code)

- ✅ Gather UI Data: All values are collected from WizardContext (`data`).
- ✅ Construct `StoryPrompt`: All fields are mapped correctly, including type conversions (e.g., age to string).
- ✅ Omit Optional/Future Fields: Optional fields like `character.appearance`, `language`, `style`, and `educationalFocus` are omitted for now.
- ✅ Ensure Generator Handles Missing Optional Fields: The generator handles missing optional fields gracefully, using defaults or omitting sections as needed.

## Additional Recommendations

- ✅ Generation Feedback: The UI now shows a loading spinner, estimated wait (~10 seconds), a live elapsed timer, and a simulated progress bar that fills over 10 seconds. If the wait exceeds 10 seconds, the bar pulses and the message updates to 'Still working... Thanks for your patience!'.
- **Story Rating/Feedback:** Implement a user rating system (e.g., thumbs up/down) for generated stories to gather data for future improvements.
- **Regeneration Option:** Add a "Try Again" or "Regenerate" button, perhaps allowing minor prompt tweaks.
- ✅ Error Handling: Enhanced error handling in `generateStory` for API errors, rate limits, content filtering, etc. Returns specific error types to the caller.
- **Negative Prompts:** Consider adding an optional `negativePrompt` field to the `StoryPrompt` interface and generator logic to steer the AI away from undesired content.
- ✅ Logging: Implemented server-side logging for generation requests (anonymized prompts) and outcomes (success/failure, token usage) for monitoring and analysis.

## Future Enhancements

- **JSON Output:** Modify the generator's system prompt to request structured JSON output (e.g., `{ "title": "...", "content": "..." }`) for more reliable parsing.
- **Implement Optional Fields:** Add UI elements (potentially tied to subscription tiers) for `character.appearance`, `language`, `style`, `educationalFocus`. Update the prompt generation logic to include these when provided.
- **Refine Prompt Instructions:** Add specific guidance to the AI on how to handle optional fields when they _are_ provided (e.g., "If `style` is 'educational', focus on the `educationalFocus` points."). Update prompts based on user feedback/ratings.
- **AI Parameter Tuning:** Experiment with `temperature`, `frequency_penalty`, `presence_penalty`, and `max_tokens` in `generateStory` to optimize story quality.
- **Prompt Versioning:** Consider adding internal versioning for prompts if they undergo significant changes, to aid debugging and analysis.
- **Narration & Illustrations:** Integrate text-to-speech (TTS) and potential image generation based on subscription tier.

## Subscription Tier Integration Plan

**Goal:** Gate access to features/options based on user subscription status (e.g., Free vs. Premium).

**Strategy:** Enforcement occurs primarily in the **calling code** (API route/serverless function) _before_ `generateStory` is invoked. `generateStory` remains mostly tier-agnostic.

1.  **Tier Definition (Example):**
    - **Free:** Limited generations/month, restricted options (basic character fields, setting, theme, limited length/reading levels?), no narration/illustrations.
    - **Premium:** Unlimited generations, all options available (`appearance`, `language`, `style`, `educationalFocus`, etc.), narration, illustrations, potentially better AI model.
2.  **Enforcement (Calling Code):**
    - **Check Status:** Fetch user's subscription tier.
    - **Check Limits:** If Free, verify generation quota.
    - **Build Tier-Appropriate Prompt:** When creating the `StoryPrompt` object:
      - Include **only** the fields/options allowed by the user's tier. Omit premium-only fields (`style`, `language`, etc.) if the user is Free.
      - The UI should ideally also hide/disable premium options for Free users.
    - **(Optional) Select Model:** Choose the AI model based on tier (e.g., `gpt-3.5-turbo` for Free, `gpt-4-turbo-preview` for Premium) before calling the OpenAI API.
3.  **Generator (`generateStory`) Role:**
    - Receives a `StoryPrompt` containing only the allowed fields for that user/request.
    - The system prompt handles missing optional fields gracefully (uses defaults, omits sections).
    - No specific `if (tier === 'Premium')` logic is needed within the core `generateStory` function itself.

## Next Steps

1.  ✅ **Implement UI Changes:** Add the "Reading Level" selection input to the wizard. (Completed)
2.  ✅ **Implement Generator Changes:** Modify the `systemPrompt` in `utils/ai/story-generator.ts` to decouple length and complexity, and improve input validation. (Completed)
3.  ✅ **Update Calling Code:** Modify the code that calls `generateStory` (`app/api/story/generate/route.ts`) to perform the new data mapping (including the new `readingLevel` and `length`/`durationMinutes` usage). (Completed)
    - ✅ _Fix: Corrected API request payload construction in `StoryWizard.tsx`._
    - ✅ _Fix: Corrected database column name (`readingLevel`) in API route insert._
    - ✅ _Fix: Provided default values for required `language` and `style` columns in API route insert._
4.  **Test:** Thoroughly test the end-to-end flow with different combinations of length and reading level.
    - ✅ _Fix: Resolved `ReferenceError` for `isStepValid` in `wizard-context.tsx`._
    - 🔄 Initial testing done, further testing recommended.
