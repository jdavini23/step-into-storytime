import { Story, StoryData } from '@/lib/types';
import { type StepId } from '@/lib/story-steps';

export type MessageType = 'user' | 'assistant' | 'system' | 'option';

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  quickReplies?: string[];
  timestamp?: number;
}

export interface ChatOption {
  id: string;
  label: string;
  value: any;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface ConversationState {
  messages: Message[];
  currentStep: StepId;
  storyData: StoryData;
  isTyping: boolean;
  error: string | null;
}

export type ConversationAction =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_CURRENT_STEP'; payload: StepId }
  | { type: 'UPDATE_STORY_DATA'; payload: Partial<StoryData> }
  | { type: 'SET_TYPING'; payload: boolean };

export interface ConversationContextType {
  state: ConversationState;
  sendMessage: (content: string | ChatOption) => void;
  selectOption: (option: ChatOption) => void;
  resetConversation: () => void;
  goToStep: (step: StepId) => void;
}

export interface ChatContainerProps {
  onComplete: (story: Story) => void;
  onError: (error: string) => void;
  className?: string;
}
