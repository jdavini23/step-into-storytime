import { useState, useRef, useEffect } from 'react';
import type { Message, ConversationState } from '../types';
import { generateResponse } from '@/lib/conversation-manager';

export function useChatState() {
  const [state, setState] = useState<ConversationState>({
    messages: [],
    storyData: {},
    isTyping: false,
    editingMessageId: null,
  });
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  };

  useEffect(() => {
    const container = messagesEndRef.current?.parentElement;
    if (container) {
      const isNearBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight <
        100;
      if (isNearBottom || state.isTyping) {
        scrollToBottom();
      }
    }
  }, [state.messages, state.isTyping]);

  useEffect(() => {
    const initialMessage = generateResponse('name', state);
    setState((prev) => ({
      ...prev,
      messages: [initialMessage],
    }));
  }, []);

  const handleError = (error: any, onError: (error: string) => void) => {
    let errorMessage = 'Failed to generate story. Please try again.';

    if (error.details) {
      errorMessage = `${error.error}: ${error.details}`;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    setState((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          id: Date.now().toString(),
          type: 'ai',
          content: `❌ ${errorMessage}`,
          timestamp: Date.now(),
          error: true,
          severity: 'error',
        },
      ],
    }));

    onError(errorMessage);
  };

  return {
    state,
    setState,
    input,
    setInput,
    isGenerating,
    setIsGenerating,
    isRecording,
    setIsRecording,
    messagesEndRef,
    handleError,
  };
}
