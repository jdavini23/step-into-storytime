import { useChat } from '@/lib/hooks/useChat';
import { MessageList } from '../chat/MessageList';
import { QuickReply } from '../chat/QuickReply';
import { Card } from '../ui/card';

export function PreviewContainer() {
  const { state, addMessage, addReaction } = useChat();

  const handleQuickReply = (text: string) => {
    addMessage({
      id: Date.now().toString(),
      type: 'user',
      content: text,
      timestamp: Date.now(),
    });
  };

  const handleReaction = (messageId: string, reaction: string) => {
    addReaction(messageId, reaction);
  };

  return (
    <Card className="flex flex-col h-[600px] w-full max-w-4xl mx-auto bg-background">
      <MessageList
        messages={state.messages}
        onReact={handleReaction}
        className="flex-1"
      />
      <div className="flex gap-2 p-4 border-t">
        <QuickReply
          text="Tell me a story"
          onClick={() => handleQuickReply('Tell me a story')}
        />
        <QuickReply
          text="Show me pictures"
          onClick={() => handleQuickReply('Show me pictures')}
        />
      </div>
    </Card>
  );
}
