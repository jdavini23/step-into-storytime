export interface Message {
  id: string;
  type: 'ai' | 'user';
  content: string;
  context?: {
    field: 'character' | 'setting' | 'theme' | 'length';
    value: any;
  };
  timestamp: number;
  isEditing?: boolean;
  error?: boolean;
  severity?: 'info' | 'warning' | 'error';
}

export interface StoryDataState {
  character?: {
    name: string;
    age: string;
    traits: string[];
  };
  setting?: string;
  theme?: string;
  length?: 'short' | 'medium' | 'long';
}

export interface ConversationState {
  messages: Message[];
  storyData: StoryDataState;
  isTyping: boolean;
  editingMessageId: string | null;
}

export interface ChatContainerProps {
  onComplete: (storyData: StoryDataState) => void;
  onError: (error: string) => void;
}
