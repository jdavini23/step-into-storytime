'use client';

import { ChatContainer } from '../chat/ChatContainer';
import type { Story } from '../story/common/types';
import { ConversationProvider } from '@/contexts/conversation-context';

interface StoryWizardProps {
  onComplete: (story: Story) => void;
  onError: (error: string) => void;
}

export default function StoryWizard(props: StoryWizardProps) {
  return (
    <ConversationProvider onComplete={props.onComplete} onError={props.onError}>
      <div className="w-full max-w-6xl mx-auto">
        <ChatContainer className="h-[600px]" />
      </div>
    </ConversationProvider>
  );
}
