'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface WordAnimatorProps {
  word: string;
  index: number;
  isVisible: boolean;
  isInteractive?: boolean;
  onWordClick?: (word: string) => void;
  className?: string;
}

export default function WordAnimator({
  word,
  index,
  isVisible,
  isInteractive = false,
  onWordClick,
  className,
}: WordAnimatorProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = useCallback(() => {
    if (isInteractive && onWordClick) {
      onWordClick(word);
    }
  }, [isInteractive, onWordClick, word]);

  // Check if the word is "special" (for special effects)
  const isSpecialWord = word.match(/[!?.]$/) || word.length > 8;

  const variants = {
    hidden: {
      opacity: 0,
      y: 20,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
    hover: {
      scale: isInteractive ? 1.1 : 1,
      color: isInteractive ? 'var(--primary)' : 'inherit',
      transition: {
        duration: 0.2,
      },
    },
  };

  // Special animation for punctuation and long words
  const specialVariants = {
    ...variants,
    visible: {
      ...variants.visible,
      transition: {
        duration: 0.5,
        type: 'spring',
        stiffness: 200,
      },
    },
  };

  return (
    <motion.span
      variants={isSpecialWord ? specialVariants : variants}
      initial="hidden"
      animate={isVisible ? 'visible' : 'hidden'}
      whileHover={isInteractive ? 'hover' : undefined}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleClick}
      className={cn(
        'inline-block',
        isInteractive && 'cursor-pointer',
        isHovered && isInteractive && 'text-primary',
        className
      )}
    >
      {word}
    </motion.span>
  );
}
