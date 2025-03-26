'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Message } from './types';
import { Button } from '@/components/ui/button';

interface MessageBubbleProps {
  message: Message;
  onEdit?: () => void;
}

export function MessageBubble({ message, onEdit }: MessageBubbleProps) {
  const isAI = message.type === 'ai';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'flex w-full',
        isAI ? 'justify-start' : 'justify-end'
      )}
    >
      <div
        className={cn(
          'max-w-[80%] rounded-lg p-4 mb-2',
          isAI 
            ? 'bg-secondary text-secondary-foreground' 
            : 'bg-primary text-primary-foreground'
        )}
      >
        <p className="text-sm">{message.content}</p>
        {!isAI && onEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="mt-2 text-xs opacity-70 hover:opacity-100"
          >
            Edit
          </Button>
        )}
      </div>
    </motion.div>
  );
}
