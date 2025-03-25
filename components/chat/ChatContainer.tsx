'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import { Message, ConversationState, ChatContainerProps } from './types';
import { 
  ConversationStep, 
  determineNextStep, 
  generateResponse, 
  processUserInput 
} from '@/lib/conversation-manager';
import { SETTINGS, THEMES, LENGTH_OPTIONS } from '../../lib/story-options';
import { useAuth } from '@/contexts/auth-context';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentStep, setCurrentStep] = useState<ConversationStep>('name');

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  };

  useEffect(() => {
    // Only scroll if we're near the bottom already or if we're typing
    const container = messagesEndRef.current?.parentElement;
    if (container) {
      const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
      if (isNearBottom || state.isTyping) {
        scrollToBottom();
      }
    }
  }, [state.messages, state.isTyping]);

  // Initial greeting
  useEffect(() => {
    const initialMessage = generateResponse('name', state);
    setState(prev => ({
      ...prev,
      messages: [initialMessage],
    }));
  }, []);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault(); // Prevent form submission
    if (!input.trim() && !state.editingMessageId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: Date.now(),
    };

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isTyping: true,
    }));

    setInput('');

    // Process user input
    const updates = processUserInput(input, currentStep, state);
    const newState = {
      ...state,
      ...updates,
    };

    // Determine next step
    const nextStep = determineNextStep(newState);
    setCurrentStep(nextStep);

    // If we've reached confirm and user says yes, generate the story
    if (currentStep === 'confirm' && input.toLowerCase().includes('yes')) {
      await generateStory(newState);
      return;
    }

    // Generate AI response for the next step
    setTimeout(() => {
      const aiResponse = generateResponse(nextStep, newState);
      setState(prev => ({
        ...prev,
        ...updates,
        messages: [...prev.messages, aiResponse],
        isTyping: false,
      }));
    }, 1000);
  };

  const generateStory = async (currentState: ConversationState) => {
    if (!authState.isAuthenticated) {
      onError('Please sign in to generate stories');
      return;
    }

    try {
      setIsGenerating(true);
      const { storyData } = currentState;

      const payload = {
        title: `${storyData.character?.name}'s ${
          SETTINGS.find((s) => s.id === storyData.setting)?.title || 'Adventure'
        }`,
        mainCharacter: {
          name: storyData.character?.name || '',
          age: storyData.character?.age || '',
          traits: storyData.character?.traits || [],
        },
        setting: SETTINGS.find((s) => s.id === storyData.setting)?.description || '',
        theme: THEMES.find((t) => t.id === storyData.theme)?.description || '',
        plotElements: [],
      };

      const response = await fetch('/api/generate-story/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to generate story');
      }

      const data = await response.json();
      const initialContent = data.content;

      // Create story in Supabase
      const storyResponse = await fetch('/api/stories', {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: payload.title,
          description: `A story about ${storyData.character?.name} in ${
            SETTINGS.find((s) => s.id === storyData.setting)?.title || 'a magical place'
          }`,
          content: initialContent,
          character_name: storyData.character?.name || '',
          character_age: storyData.character?.age || '',
          character_traits: storyData.character?.traits || [],
          theme_id: storyData.theme || '',
          setting_id: storyData.setting || '',
          reading_level: 'beginner',
          target_age: parseInt(storyData.character?.age || '6'),
          word_count: initialContent.split(/\s+/).length,
          reading_time: Math.ceil(initialContent.split(/\s+/).length / 200),
          status: 'published',
          accessibility_settings: {
            contrast: 'normal',
            motion_reduced: false,
            font_size: 'medium',
            line_height: 1.5,
          }
        }),
      });

      if (!storyResponse.ok) {
        const error = await storyResponse.json();
        throw new Error(error.error || 'Failed to save story');
      }

      const story = await storyResponse.json();
      onComplete(story);
    } catch (error) {
      console.error('Story generation error:', error);
      onError(
        error instanceof Error
          ? error.message
          : 'Failed to generate story. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const getQuickReplies = () => {
    switch (currentStep) {
      case 'setting':
        return SETTINGS.map(s => s.title);
      case 'theme':
        return THEMES.map(t => t.title);
      case 'length':
        return LENGTH_OPTIONS.map(l => l.title);
      case 'confirm':
        return ['Yes, generate story!', 'No, let me change something'];
      default:
        return [];
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-4 h-[600px] flex flex-col">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        <AnimatePresence mode="popLayout">
          {state.messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <MessageBubble message={message} onEdit={() => setState(prev => ({ ...prev, editingMessageId: message.id }))} />
            </motion.div>
          ))}
          {state.isTyping && <TypingIndicator />}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="flex gap-2 mt-auto"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your response..."
          disabled={isGenerating}
          className="flex-1"
        />
        <Button type="submit" disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Send'
          )}
        </Button>
      </form>

      {/* Quick replies */}
      <div className="flex flex-wrap gap-2 mt-2">
        {getQuickReplies().map((reply) => (
          <Button
            key={reply}
            variant="outline"
            size="sm"
            onClick={() => {
              setInput(reply);
              handleSend();
            }}
            disabled={isGenerating}
          >
            {reply}
          </Button>
        ))}
      </div>
    </Card>
  );
}
