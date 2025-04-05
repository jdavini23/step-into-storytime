'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Message } from './types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import { Smile, ThumbsUp, Heart, Star, Bot } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuth } from '@/contexts/auth-context';

interface MessageBubbleProps {
  message: Message;
  onEdit?: () => void;
  onReact?: (reaction: string) => void;
  showAvatar?: boolean;
}

const reactions = [
  { emoji: '👍', icon: ThumbsUp, label: 'Like' },
  { emoji: '❤️', icon: Heart, label: 'Love' },
  { emoji: '⭐', icon: Star, label: 'Star' },
];

export function MessageBubble({
  message,
  onEdit,
  onReact,
  showAvatar = true,
}: MessageBubbleProps) {
  const { state: authState } = useAuth();
  const isAI = message.type === 'ai';
  const userAvatar = authState.profile?.avatar_url || '/placeholder-user.jpg';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex w-full gap-3 items-end',
        isAI ? 'justify-start' : 'justify-end'
      )}
    >
      {isAI && showAvatar && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex-shrink-0"
        >
          <Avatar className="h-8 w-8 ring-2 ring-primary/10">
            <AvatarImage src="/images/ai-assistant.svg" alt="AI Assistant" />
            <AvatarFallback className="bg-primary/5">
              <Bot className="h-4 w-4 text-primary/50" />
            </AvatarFallback>
          </Avatar>
        </motion.div>
      )}

      <div className="flex-1 flex flex-col gap-1">
        <motion.div
          layout
          className={cn(
            'rounded-2xl px-4 py-2.5 max-w-[85%] shadow-sm',
            isAI
              ? 'bg-secondary/80 text-secondary-foreground rounded-tl-sm ml-0 mr-auto'
              : 'bg-primary/5 hover:bg-primary/10 transition-colors text-foreground rounded-tr-sm ml-auto mr-0',
            message.error && 'bg-destructive/10 text-destructive'
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </motion.div>

        <div
          className={cn(
            'flex items-center gap-1.5 text-xs text-muted-foreground px-1',
            isAI ? 'justify-start ml-0 mr-auto' : 'justify-end ml-auto mr-0'
          )}
        >
          {message.status && !isAI && (
            <span className="opacity-50">• {message.status}</span>
          )}
          {message.timestamp && (
            <span className="opacity-50">
              {format(message.timestamp, 'HH:mm')}
            </span>
          )}
          {message.error && <span className="text-destructive">• Error</span>}
        </div>

        {onReact && (
          <motion.div
            className={cn('flex gap-1', isAI ? 'justify-start' : 'justify-end')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {reactions.map((reaction) => (
              <TooltipProvider key={reaction.label}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                      onClick={() => onReact(reaction.emoji)}
                    >
                      <reaction.icon className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{reaction.label}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </motion.div>
        )}
      </div>

      {!isAI && showAvatar && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex-shrink-0"
        >
          <Avatar className="h-8 w-8 ring-2 ring-primary/10">
            <AvatarImage src={userAvatar} alt="User" />
            <AvatarFallback>
              {authState.profile?.name?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
        </motion.div>
      )}
    </motion.div>
  );
}
