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
    id: Date.now().toString(),
    type: 'ai',
    timestamp: Date.now(),
  };

  switch (step) {
    case 'name':
      return {
        ...baseMessage,
        content:
          "Hi! I'm excited to help you create a story. What's the name of our main character?",
      } as Message;

    case 'age':
      return {
        ...baseMessage,
        content: `Nice to meet ${state.storyData.character?.name}! How old are they?`,
      } as Message;

    case 'traits':
      return {
        ...baseMessage,
        content: 'What are three words that best describe their personality?',
      } as Message;

    case 'setting':
      const settingOptions = SETTINGS.map((s) => s.title).join(', ');
      return {
        ...baseMessage,
        content: `Where should our story take place? Choose from: ${settingOptions}`,
      } as Message;

    case 'theme':
      const themeOptions = THEMES.map((t) => t.title).join(', ');
      return {
        ...baseMessage,
        content: `What kind of story should it be? Choose from: ${themeOptions}`,
      } as Message;

    case 'length':
      const lengthOptions = LENGTH_OPTIONS.map(
        (l) => `${l.title} (${l.description})`
      ).join(', ');
      return {
        ...baseMessage,
        content: `How long should the story be? ${lengthOptions}`,
      } as Message;

    case 'confirm':
      const { character, setting, theme, length } = state.storyData;
      return {
        ...baseMessage,
        content: `Great! I'll create a ${length} story about ${
          character?.name
        }, age ${character?.age}, who is ${character?.traits?.join(
          ', '
        )}. The story will take place in ${setting} and focus on ${theme}. Should I generate the story now?`,
      } as Message;

    default:
      return {
        ...baseMessage,
        content: "I'm not sure what to ask next. Let's start over?",
      } as Message;
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

  switch (currentStep) {
    case 'name':
      newStoryData.character = {
        ...newStoryData.character!,
        name: input,
      };
      break;

    case 'age':
      newStoryData.character = {
        ...newStoryData.character!,
        age: input,
      };
      break;

    case 'traits':
      newStoryData.character = {
        ...newStoryData.character!,
        traits: input
          .split(/[,\s]+/)
          .filter(Boolean)
          .slice(0, 3),
      };
      break;

    case 'setting':
      const setting = SETTINGS.find(
        (s) =>
          s.title.toLowerCase().includes(input.toLowerCase()) ||
          input.toLowerCase().includes(s.title.toLowerCase())
      );
      if (setting) newStoryData.setting = setting.id;
      break;

    case 'theme':
      const theme = THEMES.find(
        (t) =>
          t.title.toLowerCase().includes(input.toLowerCase()) ||
          input.toLowerCase().includes(t.title.toLowerCase())
      );
      if (theme) newStoryData.theme = theme.id;
      break;

    case 'length':
      const length = LENGTH_OPTIONS.find(
        (l) => l.title.toLowerCase() === input.toLowerCase()
      );
      if (length)
        newStoryData.length = length.id as 'short' | 'medium' | 'long';
      break;
  }

  return { storyData: newStoryData };
}
