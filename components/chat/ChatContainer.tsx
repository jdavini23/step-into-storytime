'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2, Mic, Send, Plus } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { QuickReply } from './QuickReply';
import type {
  Message,
  ConversationState,
  ChatContainerProps,
  StoryDataState,
} from './types';
import {
  determineNextStep,
  generateResponse,
  processUserInput,
} from '@/lib/conversation-manager';
import type { ConversationStep } from '@/lib/conversation-manager';
import { SETTINGS, THEMES, LENGTH_OPTIONS } from '../../lib/story-options';
import { useAuth } from '@/contexts/auth-context';
import { cn } from '@/lib/utils';

const handleError = (
  error: any,
  setState: React.Dispatch<React.SetStateAction<ConversationState>>,
  onError: (error: string) => void
) => {
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

export function ChatContainer({ onComplete, onError }: ChatContainerProps) {
  const { state: authState } = useAuth();
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
  const [currentStep, setCurrentStep] = useState<ConversationStep>('name');
  const inputRef = useRef<HTMLInputElement>(null);
  let nextStep: ConversationStep;
  let previousStep: ConversationStep;

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

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() && !state.editingMessageId) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: input,
      timestamp: Date.now(),
      status: 'sent',
    };

    // Check if this is a duplicate message within 5 seconds
    const isDuplicate = state.messages.some(
      (message) =>
        message.type === 'user' &&
        message.content.toLowerCase() === input.toLowerCase() &&
        Date.now() - message.timestamp < 5000
    );

    if (!isDuplicate) {
      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        isTyping: true,
      }));

      setInput('');

      const updates = processUserInput(input, currentStep, state);
      const newState = {
        ...state,
        ...updates,
      };

      // Determine the next step based on the updated state
      const nextStepToUse = determineNextStep(newState);

      // Only update the current step if it's different
      if (nextStepToUse !== currentStep) {
        setCurrentStep(nextStepToUse);
      }

      if (currentStep === 'confirm' && input.toLowerCase().includes('yes')) {
        await generateStory(newState);
        return;
      }

      // Add delay for natural conversation flow
      setTimeout(() => {
        const aiResponse = generateResponse(nextStepToUse, newState);

        setState((prev) => ({
          ...prev,
          ...updates,
          messages: [...prev.messages, aiResponse],
          isTyping: false,
        }));
      }, 1000);
    } else {
      setInput('');
    }
  };

  const generateStory = async (currentState: ConversationState) => {
    if (!authState.isAuthenticated) {
      handleError(
        new Error('Please sign in to generate stories'),
        setState,
        onError
      );
      return;
    }

    try {
      setIsGenerating(true);
      const { storyData } = currentState;

      const payload = {
        title: `${storyData.character?.name}'s ${
          SETTINGS.find((s) => s.id === storyData.setting)?.title || 'Adventure'
        }`,
        character: {
          name: storyData.character?.name || '',
          age: storyData.character?.age || '',
          traits: storyData.character?.traits || [],
        },
        setting: SETTINGS.find((s) => s.id === storyData.setting)?.id || '',
        theme: THEMES.find((t) => t.id === storyData.theme)?.id || '',
        plotElements: [],
      };

      const response = await fetch('/api/generate-story/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate story');
      }

      const data = await response.json();

      // Create story in Supabase
      const selectedSetting = SETTINGS.find((s) => s.id === storyData.setting);
      const selectedTheme = THEMES.find((t) => t.id === storyData.theme);

      const storyPayload = {
        id: crypto.randomUUID(),
        title: `${storyData.character?.name}'s ${
          selectedSetting?.title || 'Adventure'
        }`,
        content: JSON.stringify(data.content),
        character: {
          name: storyData.character?.name || '',
          age: storyData.character?.age || '',
          traits: storyData.character?.traits || [],
        },
        setting: selectedSetting?.id,
        theme: selectedTheme?.id,
        plot_elements: [],
        is_published: false,
        user_id: authState.user?.id,
        thumbnail_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const storyResponse = await fetch('/api/stories', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storyPayload),
      });

      if (!storyResponse.ok) {
        const errorData = await storyResponse.json();
        throw new Error(
          errorData.error || `Failed to save story: ${storyResponse.status}`
        );
      }

      const story = await storyResponse.json();

      setState((prev) => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            id: Date.now().toString(),
            type: 'ai',
            content:
              '✨ Story created successfully! Redirecting you to your story...',
            timestamp: Date.now(),
          },
        ],
      }));

      onComplete(story);
    } catch (error: any) {
      console.error('Story generation error:', error);
      handleError(error, setState, onError);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleReact = (messageId: string, reaction: string) => {
    setState((prev) => ({
      ...prev,
      messages: prev.messages.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              reactions: [...(msg.reactions || []), reaction],
            }
          : msg
      ),
    }));
  };

  const getQuickReplies = () => {
    switch (currentStep) {
      case 'setting':
        return SETTINGS.map((setting) => ({
          label: `🌈 ${setting.title}`,
          value: setting.id,
        }));
      case 'theme':
        return THEMES.map((theme) => ({
          label: `✨ ${theme.title}`,
          value: theme.id,
        }));
      case 'length':
        return LENGTH_OPTIONS.map((option) => ({
          label: `📚 ${option.title}`,
          value: option.id,
        }));
      case 'confirm':
        return [
          { label: '✨ Yes, generate story!', value: 'yes' },
          { label: '🔄 No, let me change something', value: 'no' },
        ];
      default:
        return [];
    }
  };

  const quickReplies = getQuickReplies();

  return (
    <Card className="flex flex-col h-full overflow-hidden rounded-xl border shadow-lg">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence initial={false}>
          {state.messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onReact={
                message.type === 'ai'
                  ? (reaction) => handleReact(message.id, reaction)
                  : undefined
              }
            />
          ))}
        </AnimatePresence>
        {state.isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {quickReplies.length > 0 && (
        <div className="px-4 py-2 border-t">
          <QuickReply
            options={quickReplies}
            onSelect={(value) => {
              setInput(value);
              handleSend();
            }}
            variant="ghost"
          />
        </div>
      )}

      <form
        onSubmit={handleSend}
        className="p-4 border-t flex items-center gap-2"
      >
        <div className="relative flex-1">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="pr-10"
            disabled={isGenerating}
          />
          {input.trim() && (
            <Button
              type="submit"
              size="icon"
              variant="ghost"
              className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            >
              <Send className="h-5 w-5" />
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
