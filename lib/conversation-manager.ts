import {
  Message,
  ConversationState,
  StoryDataState,
} from '@/components/chat/types';
import { SETTINGS, THEMES, LENGTH_OPTIONS } from './story-options';

export type ConversationStep =
  | 'name'
  | 'age'
  | 'traits'
  | 'setting'
  | 'theme'
  | 'length'
  | 'confirm';

export function determineNextStep(state: ConversationState): ConversationStep {
  const { storyData } = state;

  if (!storyData.character?.name) return 'name';
  if (!storyData.character?.age) return 'age';
  if (!storyData.character?.traits?.length) return 'traits';
  if (!storyData.setting) return 'setting';
  if (!storyData.theme) return 'theme';
  if (!storyData.length) return 'length';
  return 'confirm';
}

export function generateResponse(
  step: ConversationStep,
  state: ConversationState
): Message {
  const baseMessage: Partial<Message> = {
    id: crypto.randomUUID(),
    type: 'ai',
    timestamp: Date.now(),
  };

  const hasExistingMessage = state.messages.some(
    (msg) => msg.type === 'ai' && msg.content?.includes(getStepIdentifier(step))
  );

  if (hasExistingMessage) {
    return {
      ...baseMessage,
      content: "I'm waiting for your response!",
      isRepeat: true,
    } as Message;
  }

  switch (step) {
    case 'name':
      return {
        ...baseMessage,
        content:
          "✨ Let's begin our magical adventure! First, tell me the name of our story's hero - who will be starring in this tale?",
      } as Message;

    case 'age':
      return {
        ...baseMessage,
        content: `🎂 And how many birthdays has our wonderful friend ${state.storyData.character?.name} celebrated?`,
      } as Message;

    case 'traits':
      return {
        ...baseMessage,
        content:
          '🌟 What makes our hero special? Pick the magical qualities that make them shine! (Choose as many as you like)',
      } as Message;

    case 'setting':
      const settingOptions = SETTINGS.map((s) => `🌈 ${s.title}`).join(', ');
      return {
        ...baseMessage,
        content: `🗺️ Now, let's pick a magical place where our story will unfold! Where shall we go? Choose from: ${settingOptions}`,
      } as Message;

    case 'theme':
      const themeOptions = THEMES.map((t) => `✨ ${t.title}`).join(', ');
      return {
        ...baseMessage,
        content: `💫 Every great story has a special message! Which magical theme speaks to your heart? Choose from: ${themeOptions}`,
      } as Message;

    case 'length':
      const lengthOptions = LENGTH_OPTIONS.map(
        (l) => `📚 ${l.title} (${l.description})`
      ).join(', ');
      return {
        ...baseMessage,
        content: `📖 How long shall our magical tale be? ${lengthOptions}`,
      } as Message;

    case 'confirm':
      const { character, setting, theme, length } = state.storyData;
      const selectedSetting = SETTINGS.find((s) => s.id === setting)?.title;
      const selectedTheme = THEMES.find((t) => t.id === theme)?.title;

      return {
        ...baseMessage,
        content: `✨ Wonderful! I'll weave a ${length} tale about ${
          character?.name
        }, our ${character?.age}-year-old hero who is ${character?.traits?.join(
          ', '
        )}. Our adventure will take place in ${selectedSetting} and celebrate the power of ${selectedTheme}. 
        
        🪄 Shall I wave my magic wand and bring this story to life?`,
      } as Message;

    default:
      return {
        ...baseMessage,
        content:
          "🎭 Oh my! I seem to have lost my place in the story. Let's start our magical journey again!",
      } as Message;
  }
}

function getStepIdentifier(step: ConversationStep): string {
  switch (step) {
    case 'name':
      return "Let's begin our magical adventure";
    case 'age':
      return 'how many birthdays';
    case 'traits':
      return 'What makes our hero special';
    case 'setting':
      return 'pick a magical place';
    case 'theme':
      return 'special message';
    case 'length':
      return 'How long shall our magical tale be';
    case 'confirm':
      return 'Shall I wave my magic wand';
    default:
      return '';
  }
}

export function processUserInput(
  input: string,
  currentStep: ConversationStep,
  state: ConversationState
): { storyData: StoryDataState } {
  const newStoryData: StoryDataState = {
    ...state.storyData,
    character: state.storyData.character || { name: '', age: '', traits: [] },
  };

  if (!input.trim()) {
    return { storyData: newStoryData };
  }

  switch (currentStep) {
    case 'name':
      if (!newStoryData.character?.name) {
        newStoryData.character = {
          ...newStoryData.character!,
          name: input,
        };
      }
      break;

    case 'age':
      if (!newStoryData.character?.age) {
        newStoryData.character = {
          ...newStoryData.character!,
          age: input,
        };
      }
      break;

    case 'traits':
      if (!newStoryData.character?.traits?.length) {
        newStoryData.character = {
          ...newStoryData.character!,
          traits: input
            .split(/[,\s]+/)
            .filter(Boolean)
            .slice(0, 3),
        };
      }
      break;

    case 'setting':
      // First try exact match with the setting ID
      let setting = SETTINGS.find((s) => s.id === input);

      // If no exact match, try matching by title (case-insensitive)
      if (!setting) {
        setting = SETTINGS.find(
          (s) =>
            s.title.toLowerCase() === input.toLowerCase() ||
            input.toLowerCase().includes(s.title.toLowerCase()) ||
            s.title.toLowerCase().includes(input.toLowerCase())
        );
      }

      if (setting) {
        newStoryData.setting = setting.id;
      }
      break;

    case 'theme':
      // First try exact match with the theme ID
      let theme = THEMES.find((t) => t.id === input);

      // If no exact match, try matching by title (case-insensitive)
      if (!theme) {
        theme = THEMES.find(
          (t) =>
            t.title.toLowerCase() === input.toLowerCase() ||
            input.toLowerCase().includes(t.title.toLowerCase()) ||
            t.title.toLowerCase().includes(input.toLowerCase())
        );
      }

      if (theme) {
        newStoryData.theme = theme.id;
      }
      break;

    case 'length':
      // First try exact match with the length ID
      let length = LENGTH_OPTIONS.find((l) => l.id === input);

      // If no exact match, try matching by title (case-insensitive)
      if (!length) {
        length = LENGTH_OPTIONS.find(
          (l) => l.title.toLowerCase() === input.toLowerCase()
        );
      }

      if (length) {
        newStoryData.length = length.id as 'short' | 'medium' | 'long';
      }
      break;
  }

  return { storyData: newStoryData };
}
