'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import type { ChatOption } from './types';
import { cn } from '@/lib/utils';

interface QuickReplyProps {
  option: ChatOption;
  onSelect: (option: ChatOption) => void;
  className?: string;
}

export function QuickReply({ option, onSelect, className }: QuickReplyProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button
        onClick={() => onSelect(option)}
        className={cn(
          'bg-background hover:bg-muted text-foreground',
          'rounded-full px-6 py-2 h-auto',
          'border border-input shadow-sm',
          'transition-all duration-200',
          className
        )}
        variant="ghost"
      >
        {option.label}
      </Button>
    </motion.div>
  );
}
