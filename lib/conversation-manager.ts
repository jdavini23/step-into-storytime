import type {
  Message,
  ConversationState,
  ChatOption,
} from '@/components/chat/types';
import { type StepId } from '@/lib/story-steps';
import { type StoryData } from '@/lib/types';
import { SETTINGS, THEMES, LENGTH_OPTIONS } from './story-options';

export const WELCOME_MESSAGE = {
  id: 'welcome',
  type: 'system' as const,
  content: '✨ Hi! Ready to create a magical bedtime story together?',
  timestamp: Date.now(),
  options: [
    { id: 'start', label: "🌟 Let's Create!", value: 'start' },
    { id: 'surprise', label: '🎲 Surprise Me', value: 'surprise' },
  ],
};

const STEP_MESSAGES: Record<StepId, string> = {
  welcome: '✨ Hi! Ready to create a magical bedtime story together?',
  character: "📝 First, tell me the name of our story's hero!",
  setting: "🗺️ Now, let's pick a magical place for our story!",
  theme: '💫 What kind of magical adventure should we create?',
  length: '📚 How long should our magical tale be?',
  preview:
    "🎭 Here's a preview of our story! Would you like to make any changes?",
  complete: '✨ Your magical story is ready!',
};

const NEXT_STEPS: Record<StepId, StepId> = {
  welcome: 'character',
  character: 'setting',
  setting: 'theme',
  theme: 'length',
  length: 'preview',
  preview: 'complete',
  complete: 'complete',
};

export function generateResponse(
  step: StepId,
  state: ConversationState
): Message {
  return {
    id: crypto.randomUUID(),
    type: 'assistant',
    content: STEP_MESSAGES[step],
    timestamp: Date.now(),
  };
}

export function determineNextStep(state: ConversationState): StepId {
  return NEXT_STEPS[state.currentStep];
}

export function validateInput(
  step: StepId,
  input: string | ChatOption
): boolean {
  switch (step) {
    case 'character':
      return typeof input === 'string' && input.trim().length > 0;
    case 'setting':
    case 'theme':
    case 'length':
      return typeof input !== 'string';
    default:
      return true;
  }
}

export function processUserInput(
  input: string | ChatOption,
  step: StepId,
  state: ConversationState
): Partial<ConversationState> {
  if (!validateInput(step, input)) {
    return {
      error: 'Invalid input for this step',
    };
  }

  const updates: Partial<ConversationState> = {
    currentStep: determineNextStep(state),
    error: null,
  };

  const currentStoryData = state.storyData;
  const character = currentStoryData.character || {
    name: '',
    age: 0,
    traits: [],
  };

  switch (step) {
    case 'character':
      updates.storyData = {
        ...currentStoryData,
        character: {
          ...character,
          name: input as string,
        },
      };
      break;
    case 'setting':
      updates.storyData = {
        ...currentStoryData,
        setting: (input as ChatOption).value,
      };
      break;
    case 'theme':
      updates.storyData = {
        ...currentStoryData,
        theme: (input as ChatOption).value,
      };
      break;
    case 'length':
      updates.storyData = {
        ...currentStoryData,
        length: (input as ChatOption).value,
      };
      break;
  }

  return updates;
}
