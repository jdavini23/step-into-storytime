'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from 'react';
import type {
  ConversationState,
  ConversationContextType,
  Message,
  ChatOption,
  ConversationStep,
  StoryData,
} from '@/components/chat/types';
import {
  generateResponse,
  determineNextStep,
  processUserInput,
  WELCOME_MESSAGE,
} from '@/lib/conversation-manager';
import { generateStory } from '@/lib/story-generator';

const initialState: ConversationState = {
  messages: [WELCOME_MESSAGE],
  currentStep: 'welcome',
  storyData: {},
  isTyping: false,
  error: null,
};

type Action =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_TYPING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_STEP'; payload: ConversationStep }
  | { type: 'UPDATE_STORY_DATA'; payload: Partial<StoryData> }
  | { type: 'RESET' };

function conversationReducer(
  state: ConversationState,
  action: Action
): ConversationState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case 'SET_TYPING':
      return {
        ...state,
        isTyping: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'SET_STEP':
      return {
        ...state,
        currentStep: action.payload,
      };
    case 'UPDATE_STORY_DATA':
      return {
        ...state,
        storyData: {
          ...state.storyData,
          ...action.payload,
        },
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

interface ConversationProviderProps {
  children: React.ReactNode;
  onComplete: (story: any) => void;
  onError: (error: string) => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(
  undefined
);

export function ConversationProvider({
  children,
  onComplete,
  onError,
}: ConversationProviderProps) {
  const [state, dispatch] = useReducer(conversationReducer, initialState);

  const addMessage = useCallback((message: Message) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  }, []);

  const handleError = useCallback(
    (error: Error) => {
      const errorMessage = error.message || 'An unexpected error occurred';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      onError?.(errorMessage);
    },
    [onError]
  );

  const processMessage = useCallback(
    async (content: string | ChatOption) => {
      const updates = processUserInput(content, state.currentStep, state);

      if (updates.error) {
        handleError(new Error(updates.error));
        return;
      }

      if (updates.storyData) {
        dispatch({ type: 'UPDATE_STORY_DATA', payload: updates.storyData });
      }

      if (updates.currentStep) {
        dispatch({ type: 'SET_STEP', payload: updates.currentStep });

        // If we've reached the complete step, generate the story
        if (updates.currentStep === 'complete') {
          try {
            dispatch({ type: 'SET_TYPING', payload: true });
            const story = await generateStory(state.storyData as StoryData);
            onComplete?.(story);
          } catch (error) {
            handleError(error as Error);
          } finally {
            dispatch({ type: 'SET_TYPING', payload: false });
          }
          return;
        }

        // Add AI response for the next step
        const response = generateResponse(updates.currentStep, {
          ...state,
          ...updates,
        });
        addMessage(response);
      }
    },
    [state, addMessage, handleError, onComplete]
  );

  const sendMessage = useCallback(
    (content: string | ChatOption) => {
      const message: Message = {
        id: crypto.randomUUID(),
        type: 'user',
        content: typeof content === 'string' ? content : content.label,
        timestamp: Date.now(),
        status: 'sent',
      };

      addMessage(message);
      dispatch({ type: 'SET_TYPING', payload: true });

      // Process the message after a short delay for natural conversation flow
      setTimeout(() => {
        processMessage(content).finally(() => {
          dispatch({ type: 'SET_TYPING', payload: false });
        });
      }, 500);
    },
    [addMessage, processMessage]
  );

  const selectOption = useCallback(
    (option: ChatOption) => {
      sendMessage(option);
    },
    [sendMessage]
  );

  const resetConversation = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const goToStep = useCallback((step: ConversationStep) => {
    dispatch({ type: 'SET_STEP', payload: step });
  }, []);

  const value = {
    state,
    sendMessage,
    selectOption,
    resetConversation,
    goToStep,
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
}

export function useConversation() {
  const context = useContext(ConversationContext);
  if (context === undefined) {
    throw new Error(
      'useConversation must be used within a ConversationProvider'
    );
  }
  return context;
}
