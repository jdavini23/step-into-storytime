import type {
  Message,
  ConversationStep,
  ConversationState,
  ChatOption,
  StoryData,
} from '@/components/chat/types';
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

const STEP_MESSAGES: Record<ConversationStep, string> = {
  welcome: '✨ Hi! Ready to create a magical bedtime story together?',
  character_name: "📝 First, tell me the name of our story's hero!",
  character_age: '🎂 And how many birthdays has our hero celebrated?',
  character_traits:
    '🌟 What makes our hero special? Pick some magical qualities!',
  setting: "🗺️ Now, let's pick a magical place for our story!",
  theme: '💫 What kind of magical adventure should we create?',
  plot_elements:
    "✨ Let's add some extra magic! What special elements should we include?",
  length: '📚 How long should our magical tale be?',
  preview:
    "🎭 Here's a preview of our story! Would you like to make any changes?",
  complete: '✨ Your magical story is ready!',
};

const NEXT_STEPS: Record<ConversationStep, ConversationStep> = {
  welcome: 'character_name',
  character_name: 'character_age',
  character_age: 'character_traits',
  character_traits: 'setting',
  setting: 'theme',
  theme: 'plot_elements',
  plot_elements: 'length',
  length: 'preview',
  preview: 'complete',
  complete: 'complete',
};

export function generateResponse(
  step: ConversationStep,
  state: ConversationState
): Message {
  return {
    id: crypto.randomUUID(),
    type: 'assistant',
    content: STEP_MESSAGES[step],
    timestamp: Date.now(),
  };
}

export function determineNextStep(state: ConversationState): ConversationStep {
  return NEXT_STEPS[state.currentStep];
}

export function validateInput(
  step: ConversationStep,
  input: string | ChatOption
): boolean {
  switch (step) {
    case 'character_name':
      return typeof input === 'string' && input.trim().length > 0;
    case 'character_age':
      return typeof input === 'string' && /^\d+$/.test(input.trim());
    case 'character_traits':
    case 'setting':
    case 'theme':
    case 'plot_elements':
    case 'length':
      return typeof input !== 'string';
    default:
      return true;
  }
}

export function processUserInput(
  input: string | ChatOption,
  step: ConversationStep,
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
  const mainCharacter = currentStoryData.mainCharacter || {
    name: '',
    age: '',
    traits: [],
  };

  switch (step) {
    case 'character_name':
      updates.storyData = {
        ...currentStoryData,
        mainCharacter: {
          ...mainCharacter,
          name: input as string,
        },
      };
      break;
    case 'character_age':
      updates.storyData = {
        ...currentStoryData,
        mainCharacter: {
          ...mainCharacter,
          age: input as string,
        },
      };
      break;
    case 'character_traits':
      const option = input as ChatOption;
      updates.storyData = {
        ...currentStoryData,
        mainCharacter: {
          ...mainCharacter,
          traits: [...mainCharacter.traits, option.value],
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
    case 'plot_elements':
      updates.storyData = {
        ...currentStoryData,
        plotElements: [
          ...(currentStoryData.plotElements || []),
          (input as ChatOption).value,
        ],
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
