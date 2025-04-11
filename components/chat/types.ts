import type { Story } from '@/components/story/common/types';

export type MessageType = 'system' | 'user' | 'assistant' | 'option';

export interface Message {
  id: string;
  type: MessageType;
  content: string | React.ReactNode;
  timestamp: number;
  error?: boolean;
  severity?: 'error' | 'warning' | 'info';
  avatar?: string;
  reactions?: string[];
  status?: 'sent' | 'delivered' | 'seen';
  options?: ChatOption[];
  metadata?: Record<string, any>;
}

export interface ChatOption {
  id: string;
  label: string;
  value: any;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export type ConversationStep =
  | 'welcome'
  | 'character_name'
  | 'character_age'
  | 'character_traits'
  | 'setting'
  | 'theme'
  | 'plot_elements'
  | 'length'
  | 'preview'
  | 'complete';

export interface StoryData {
  mainCharacter: {
    name: string;
    age: string;
    traits: string[];
  };
  setting: string;
  theme: string;
  plotElements: string[];
  length: 'short' | 'medium' | 'long';
}

export interface ConversationState {
  messages: Message[];
  currentStep: ConversationStep;
  storyData: Partial<StoryData>;
  isTyping: boolean;
  error: string | null;
}

export interface ConversationContextType {
  state: ConversationState;
  sendMessage: (content: string | ChatOption) => void;
  selectOption: (option: ChatOption) => void;
  resetConversation: () => void;
  goToStep: (step: ConversationStep) => void;
}

export interface ChatContainerProps {
  onComplete: (story: Story) => void;
  onError: (error: string) => void;
  className?: string;
}
