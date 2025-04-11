'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface QuickReplyOption {
  id: string;
  label: string;
  value: any;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface QuickReplyProps {
  option: QuickReplyOption;
  onSelect: (option: QuickReplyOption) => void;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  animated?: boolean;
}

interface QuickRepliesProps {
  options: QuickReplyOption[];
  onSelect: (option: QuickReplyOption) => void;
  className?: string;
  variant?: 'default' | 'ghost' | 'outline';
  animated?: boolean;
  containerClassName?: string;
}

export function QuickReply({
  option,
  onSelect,
  className,
  variant = 'ghost',
  animated = true,
}: QuickReplyProps) {
  const ButtonWrapper = animated ? motion.div : 'div';
  const animationProps = animated
    ? {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        whileHover: { scale: 1.05 },
        whileTap: { scale: 0.95 },
      }
    : {};

  return (
    <ButtonWrapper {...animationProps}>
      <Button
        onClick={() => onSelect(option)}
        className={cn(
          'rounded-full px-6 py-2 h-auto',
          'transition-all duration-200',
          variant === 'ghost' && 'bg-background hover:bg-muted text-foreground',
          variant === 'outline' && 'border border-input shadow-sm',
          className
        )}
        variant={variant}
        disabled={option.disabled}
      >
        {option.icon && <span className="mr-2">{option.icon}</span>}
        {option.label}
      </Button>
    </ButtonWrapper>
  );
}

export function QuickReplies({
  options,
  onSelect,
  className,
  variant = 'ghost',
  animated = true,
  containerClassName,
}: QuickRepliesProps) {
  if (options.length === 0) return null;

  return (
    <div className={cn('p-4', containerClassName)}>
      <div className={cn('flex flex-wrap gap-2', className)}>
        {options.map((option) => (
          <QuickReply
            key={option.id}
            option={option}
            onSelect={onSelect}
            variant={variant}
            animated={animated}
          />
        ))}
      </div>
    </div>
  );
}

// Predefined quick reply options for story creation
export const STORY_QUICK_REPLIES: Record<string, QuickReplyOption[]> = {
  character_traits: [
    { id: 'brave', label: '🦁 Brave', value: 'brave' },
    { id: 'curious', label: '🔍 Curious', value: 'curious' },
    { id: 'kind', label: '💝 Kind', value: 'kind' },
    { id: 'clever', label: '🦊 Clever', value: 'clever' },
    { id: 'adventurous', label: '🌈 Adventurous', value: 'adventurous' },
  ],
  setting: [
    { id: 'forest', label: '🌳 Enchanted Forest', value: 'forest' },
    { id: 'space', label: '🚀 Outer Space', value: 'space' },
    { id: 'ocean', label: '🌊 Deep Ocean', value: 'ocean' },
    { id: 'castle', label: '🏰 Magical Castle', value: 'castle' },
  ],
  theme: [
    { id: 'friendship', label: '🤝 Friendship', value: 'friendship' },
    { id: 'adventure', label: '⚔️ Adventure', value: 'adventure' },
    { id: 'discovery', label: '🔮 Discovery', value: 'discovery' },
    { id: 'magic', label: '✨ Magic', value: 'magic' },
  ],
  plot_elements: [
    { id: 'dragon', label: '🐉 Friendly Dragon', value: 'dragon' },
    { id: 'fairy', label: '🧚‍♀️ Magical Fairy', value: 'fairy' },
    { id: 'treasure', label: '💎 Hidden Treasure', value: 'treasure' },
    { id: 'portal', label: '🌀 Magic Portal', value: 'portal' },
    { id: 'potion', label: '🧪 Magic Potion', value: 'potion' },
    { id: 'map', label: '🗺️ Ancient Map', value: 'map' },
  ],
  length: [
    { id: 'short', label: '📖 Short (5 min)', value: 'short' },
    { id: 'medium', label: '📚 Medium (10 min)', value: 'medium' },
    { id: 'long', label: '📚📚 Long (15 min)', value: 'long' },
  ],
};
