'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface QuickReplyProps {
  options: Array<{
    label: string;
    value: string;
    icon?: React.ReactNode;
  }>;
  onSelect: (value: string) => void;
  variant?: 'default' | 'outline' | 'ghost';
  direction?: 'horizontal' | 'vertical';
}

export function QuickReply({
  options,
  onSelect,
  variant = 'default',
  direction = 'horizontal',
}: QuickReplyProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={cn(
        'flex gap-2 my-2',
        direction === 'vertical' ? 'flex-col' : 'flex-wrap'
      )}
    >
      {options.map((option) => (
        <motion.div key={option.value} variants={item}>
          <Button
            variant={variant === 'default' ? 'secondary' : variant}
            size="sm"
            className={cn(
              'rounded-full transition-all hover:scale-105',
              variant === 'ghost' && 'hover:bg-primary/10 text-foreground',
              'flex items-center gap-2 px-4 py-2 h-auto'
            )}
            onClick={() => onSelect(option.value)}
          >
            {option.icon}
            <span className="text-sm font-medium">{option.label}</span>
          </Button>
        </motion.div>
      ))}
    </motion.div>
  );
}
