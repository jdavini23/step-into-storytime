'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: string;
  type: 'system' | 'user';
  className?: string;
}

export default function ChatMessage({
  message,
  type,
  className,
}: ChatMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn(
        'flex items-start gap-3',
        type === 'user' && 'justify-end',
        className
      )}
    >
      {type === 'system' && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary" />
        </div>
      )}
      <div
        className={cn(
          'flex-1 space-y-2 max-w-[80%]',
          type === 'user' && 'text-right'
        )}
      >
        <div
          className={cn(
            'p-4 rounded-lg',
            type === 'system'
              ? 'bg-muted text-muted-foreground'
              : 'bg-primary text-primary-foreground'
          )}
        >
          {message}
        </div>
      </div>
    </motion.div>
  );
}
