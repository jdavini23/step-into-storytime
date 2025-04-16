# Wizard Helper Text & Engagement Features Documentation

This file documents the playful, encouraging helper text messages and all engagement/UX upgrades used in the Step Into Storytime wizard. Use this as a reference for copy, animation, and delight features.

---

## Step-by-Step Helper Text

- **Character Step:**

  > Let's pick your hero's name and look!

- **Theme Step:**

  > What kind of adventure will it be?

- **Personal Touch/Setting Step:**

  > Add something special to your story!

- **Educational Step:**

  > Want to add a lesson or value to your story? (Optional)

- **Length Step:**

  > How long and colorful should your story be?

- **Preview Step:**
  > Ready? Let's make your magical story!

---

## Engagement & Delight Features (Planned & Completed)

### 1. Animated Progress Bar (Completed)

- **What:** Progress bar with a cartoon mascot (star) that moves as the user advances, and playful bounce/glow for the current step.
- **How:** Framer Motion for animation, emoji for mascot (upgradeable to SVG/Lottie).
- **File:** `components/story-wizard/navigation/WizardProgress.tsx`

### 2. Playful Helper Text (Completed)

- **What:** Friendly, step-specific messages in a cartoon speech bubble at the top of each step.
- **How:** `StepHelperText` component, styled with pastel colors and SVG tail.
- **File:** `components/story-wizard/StepHelperText.tsx`

### 3. Animated Step Transitions (Planned)

- **What:** Steps slide, fade, or flip in/out for smooth, magical transitions.
- **How:** Framer Motion `AnimatePresence` and `motion.div` wrappers in the wizard.
- **File:** `components/story-wizard/StoryWizard.tsx`

### 4. Cartoon Character/Avatar Preview (Planned)

- **What:** Live-updating cartoon avatar that reflects user choices (gender, traits, etc.).
- **How:** Start with static SVGs, upgrade to animated SVG/Lottie for expressions/movement.
- **File:** `components/story-wizard/steps/CharacterStep.tsx` (and shared avatar component)

### 5. Sound Effects (Planned)

- **What:** Fun, gentle sounds for button presses, transitions, and story generation (with mute toggle).
- **How:** HTML5 `<audio>` elements, sound files in `public/sounds/`, mute state in React.
- **File:** Button sound in `CharacterStep.tsx`, to be expanded to other steps.

### 6. Interactive, Animated Preview Pane (Planned)

- **What:** Story preview area styled as a storybook, with animated page turns or background changes as choices are made.
- **How:** Framer Motion for animation, themed backgrounds, possible Lottie for page turns.
- **File:** `components/story-wizard/steps/PreviewStep.tsx`

### 7. Accessibility & Responsiveness (Ongoing)

- **What:** Large touch targets, high contrast, ARIA labels, keyboard navigation, dark mode support.
- **How:** Tailwind CSS, semantic HTML, manual ARIA/keyboard checks.
- **File:** All wizard components.

---

## Usage

- These messages are displayed using the `StepHelperText` component at the top of each wizard step.
- Update this file whenever you change or add new helper text for consistency and future localization.
- Use as a reference for copy, animation, and delight features.
- Helps with future localization, accessibility, and design reviews.
