import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageBubble } from './MessageBubble';
import type { Message } from './types';
import { cn } from '@/lib/utils';

interface MessageListProps {
  messages: Message[];
  onReact: (messageId: string, reaction: string) => void;
  className?: string;
}

export function MessageList({
  messages,
  onReact,
  className,
}: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages]);

  const sortedMessages = [...messages].sort((a, b) => {
    const aTime = a.timestamp || 0;
    const bTime = b.timestamp || 0;
    return aTime - bTime;
  });

  return (
    <div
      ref={containerRef}
      className={cn('flex flex-col gap-4 overflow-y-auto p-4', className)}
    >
      <AnimatePresence mode="popLayout">
        {sortedMessages.map((message) => (
          <motion.div
            key={message.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            <MessageBubble
              message={message}
              onReact={onReact}
              className="mb-4"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
