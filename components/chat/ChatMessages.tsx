import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageBubble } from './MessageBubble';
import { TypingIndicator } from './TypingIndicator';
import type { Message } from './types';

interface ChatMessagesProps {
  messages: Message[];
  isTyping: boolean;
}

export function ChatMessages({ messages, isTyping }: ChatMessagesProps) {
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
    // Only scroll if the new message is from the assistant or if it's a user message being sent
    const lastMessage = messages[messages.length - 1];
    if (
      lastMessage?.type === 'assistant' ||
      (lastMessage?.type === 'user' && !isTyping)
    ) {
      scrollToBottom();
    }
  }, [messages, isTyping]);

  return (
    <div className="absolute inset-0 overflow-y-auto scroll-smooth">
      <div className="p-6 space-y-8">
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-2"
            >
              <MessageBubble
                message={message}
                onReact={message.type === 'assistant' ? () => {} : undefined}
              />
            </motion.div>
          ))}
        </AnimatePresence>
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} className="h-px" />
      </div>
    </div>
  );
}
