'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
  className?: string;
}

export function TypingIndicator({ className }: TypingIndicatorProps) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <div className="h-12 w-12 rounded-full bg-background border-2 border-secondary flex items-center justify-center">
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
      <div className="bg-secondary/10 rounded-3xl px-6 py-4 text-base text-foreground">
        <div className="flex gap-1">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: 0,
            }}
            className="w-2 h-2 rounded-full bg-muted-foreground"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: 0.2,
            }}
            className="w-2 h-2 rounded-full bg-muted-foreground"
          />
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: 0.4,
            }}
            className="w-2 h-2 rounded-full bg-muted-foreground"
          />
        </div>
      </div>
    </div>
  );
}
