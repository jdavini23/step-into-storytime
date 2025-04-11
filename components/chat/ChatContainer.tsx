'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessages } from './ChatMessages';
import { ChatInput } from './ChatInput';
import { ChatQuickReplies } from './ChatQuickReplies';
import { ChatProgress } from './ChatProgress';
import { StoryPreview } from '../preview/StoryPreview';
import { useConversation } from '@/contexts/conversation-context';
import { cn } from '@/lib/utils';

interface ChatContainerProps {
  className?: string;
}

export function ChatContainer({ className }: ChatContainerProps) {
  const { state, sendMessage, selectOption } = useConversation();
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const handleSend = async (message: string) => {
    setIsGenerating(true);
    try {
      await sendMessage(message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 h-full max-h-[600px]">
      <Card
        className={cn(
          'flex flex-col xl:col-span-9 overflow-hidden rounded-3xl border-0 shadow-lg bg-white',
          'max-h-[600px]',
          className
        )}
      >
        <div className="flex-1 relative">
          <ChatMessages messages={state.messages} isTyping={state.isTyping} />
        </div>

        {state.currentStep === 'preview' && (
          <div className="px-6 py-2 border-t border-primary/5">
            <Button
              variant="ghost"
              className="w-full flex items-center justify-center gap-2 text-primary"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? (
                <>
                  <EyeOff className="h-4 w-4" /> Hide Preview
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" /> Show Preview
                </>
              )}
            </Button>
          </div>
        )}

        <div className="flex-none border-t border-primary/5 bg-[#FDF7FF]">
          <ChatQuickReplies
            currentStep={state.currentStep}
            onSelect={selectOption}
          />
          <ChatInput onSend={handleSend} isGenerating={isGenerating} />
        </div>
      </Card>

      <div className="hidden xl:block xl:col-span-3">
        <ChatProgress currentStep={state.currentStep} />

        {showPreview && state.currentStep === 'preview' && (
          <div className="mt-8">
            <StoryPreview storyData={state.storyData} />
          </div>
        )}
      </div>
    </div>
  );
}
