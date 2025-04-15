'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Message } from './types';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import {
  Sparkles,
  Wand,
  Wand2,
  ThumbsUp,
  Heart,
  Star,
  Bot,
} from 'lucide-react';
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
  className?: string;
}

const reactions = [
  { emoji: '✨', icon: Sparkles, label: 'Magical' },
  { emoji: '💫', icon: Wand, label: 'Wonderful' },
  { emoji: '⭐', icon: Star, label: 'Star' },
];

const bubbleVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.9,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.9,
  },
  hover: {
    scale: 1.02,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10,
    },
  },
};

const avatarVariants = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },
};

export function MessageBubble({
  message,
  onEdit,
  onReact,
  showAvatar = true,
  className,
}: MessageBubbleProps) {
  const { state: authState } = useAuth();
  const isUser = message.type === 'user';
  const isAssistant = message.type === 'assistant';

  return (
    <motion.div
      variants={bubbleVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover="hover"
      className={cn(
        'flex items-start gap-4',
        isUser ? 'flex-row-reverse' : 'flex-row',
        className
      )}
    >
      {showAvatar && (
        <motion.div
          variants={avatarVariants}
          initial="initial"
          animate="animate"
        >
          <Avatar
            className={cn(
              'rounded-full bg-background border-2',
              isUser ? 'border-primary' : 'border-secondary',
              'h-12 w-12 shrink-0'
            )}
          >
            {isUser ? (
              <AvatarImage src="/avatars/user.png" alt="User" />
            ) : (
              <div className="flex items-center justify-center h-full w-full">
                <div className="w-8 h-8">
                  <svg
                    viewBox="0 0 36 36"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18 0C8.06 0 0 8.06 0 18s8.06 18 18 18 18-8.06 18-18S27.94 0 18 0zm0 33c-8.28 0-15-6.72-15-15S9.72 3 18 3s15 6.72 15 15-6.72 15-15 15z"
                      className="fill-muted-foreground"
                    />
                    <path
                      d="M18 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8 16H10c0-4.42 3.58-8 8-8s8 3.58 8 8z"
                      className="fill-muted-foreground"
                    />
                  </svg>
                </div>
              </div>
            )}
          </Avatar>
        </motion.div>
      )}

      <div
        className={cn(
          'rounded-3xl px-6 py-4 max-w-[80%] text-base leading-relaxed shadow-sm',
          isUser
            ? 'bg-primary/10 text-foreground'
            : 'bg-secondary/10 text-foreground'
        )}
      >
        {message.content}
      </div>

      {onReact && (
        <motion.div
          className={cn('flex gap-1', isUser ? 'justify-start' : 'justify-end')}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: 'spring' }}
        >
          {reactions.map((reaction, index) => (
            <TooltipProvider key={reaction.label}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      'h-6 w-6 p-0 opacity-60 hover:opacity-100 hover:scale-125 transition-all',
                      'hover:bg-accent/20'
                    )}
                    onClick={() => onReact(reaction.emoji)}
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.1 * index }}
                    >
                      <reaction.icon className="h-4 w-4" />
                    </motion.div>
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
    </motion.div>
  );
}
