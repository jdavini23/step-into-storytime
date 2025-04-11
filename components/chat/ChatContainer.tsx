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

// Constants for styling
const CHAT_CONTAINER_STYLES = {
  base: 'grid grid-cols-1 xl:grid-cols-12 gap-6 h-full max-h-[600px]',
  card: 'flex flex-col xl:col-span-9 overflow-hidden rounded-3xl border-0 shadow-lg bg-white max-h-[600px]',
  footer: 'flex-none border-t border-primary/5 bg-[#FDF7FF]',
};

// Custom hook for managing preview state
function usePreviewToggle() {
  const [showPreview, setShowPreview] = useState(false);

  const togglePreview = () => setShowPreview((prev) => !prev);

  return {
    showPreview,
    togglePreview,
  };
}

// Separate component for the preview toggle button
function PreviewToggle({
  showPreview,
  onToggle,
}: {
  showPreview: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="px-6 py-2 border-t border-primary/5">
      <Button
        variant="ghost"
        className="w-full flex items-center justify-center gap-2 text-primary"
        onClick={onToggle}
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
  );
}

interface ChatContainerProps {
  className?: string;
}

export function ChatContainer({ className }: ChatContainerProps) {
  // Hooks
  const { state, sendMessage, selectOption } = useConversation();
  const { showPreview, togglePreview } = usePreviewToggle();
  const [isGenerating, setIsGenerating] = useState(false);

  // Handlers
  const handleSend = async (message: string) => {
    try {
      setIsGenerating(true);
      await sendMessage(message);
    } catch (error) {
      console.error('Failed to send message:', error);
      // You might want to show an error toast or message here
    } finally {
      setIsGenerating(false);
    }
  };

  // Render helpers
  const renderMainContent = () => (
    <Card className={cn(CHAT_CONTAINER_STYLES.card, className)}>
      {/* Messages section */}
      <div className="flex-1 relative">
        <ChatMessages messages={state.messages} isTyping={state.isTyping} />
      </div>

      {/* Preview toggle */}
      {state.currentStep === 'preview' && (
        <PreviewToggle showPreview={showPreview} onToggle={togglePreview} />
      )}

      {/* Input section */}
      <div className={CHAT_CONTAINER_STYLES.footer}>
        <ChatQuickReplies
          currentStep={state.currentStep}
          onSelect={selectOption}
        />
        <ChatInput onSend={handleSend} isGenerating={isGenerating} />
      </div>
    </Card>
  );

  const renderSidebar = () => (
    <div className="hidden xl:block xl:col-span-3">
      <ChatProgress currentStep={state.currentStep} />
      {showPreview && state.currentStep === 'preview' && (
        <div className="mt-8">
          <StoryPreview storyData={state.storyData} />
        </div>
      )}
    </div>
  );

  return (
    <div className={CHAT_CONTAINER_STYLES.base}>
      {renderMainContent()}
      {renderSidebar()}
    </div>
  );
}
