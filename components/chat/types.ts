import type { Story } from '@/components/story/common/types';

export type MessageType = 'user' | 'ai';

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  timestamp: number;
  error?: boolean;
  severity?: 'error' | 'warning' | 'info';
  avatar?: string;
  reactions?: string[];
  status?: 'sent' | 'delivered' | 'seen';
  isRepeat?: boolean;
}

export interface StoryDataState {
  character?: {
    name?: string;
    age?: string;
    traits?: string[];
  };
  setting?: string;
  theme?: string;
  length?: string;
}

export interface ConversationState {
  messages: Message[];
  storyData: Partial<StoryDataState>;
  isTyping: boolean;
  editingMessageId: string | null;
}

export interface ChatContainerProps {
  onComplete: (storyData: StoryDataState) => void;
  onError: (error: string) => void;
}
