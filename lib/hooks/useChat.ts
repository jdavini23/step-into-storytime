import { useReducer, useCallback } from 'react';
import type { Message, ChatState } from '@/components/chat/types';

type ChatAction =
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_REACTION'; payload: { messageId: string; reaction: string } };

const initialState: ChatState = {
  messages: [],
  isLoading: false,
  error: null,
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'ADD_REACTION':
      return {
        ...state,
        messages: state.messages.map((message) =>
          message.id === action.payload.messageId
            ? {
                ...message,
                reactions: [
                  ...(message.reactions || []),
                  action.payload.reaction,
                ],
              }
            : message
        ),
      };
    default:
      return state;
  }
}

export function useChat() {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  const addMessage = useCallback((message: Message) => {
    dispatch({ type: 'ADD_MESSAGE', payload: message });
  }, []);

  const setLoading = useCallback((isLoading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: isLoading });
  }, []);

  const setError = useCallback((error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const addReaction = useCallback((messageId: string, reaction: string) => {
    dispatch({ type: 'ADD_REACTION', payload: { messageId, reaction } });
  }, []);

  return {
    state,
    addMessage,
    setLoading,
    setError,
    addReaction,
  };
}
