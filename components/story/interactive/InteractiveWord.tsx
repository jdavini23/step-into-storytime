import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface InteractiveWordProps {
  word: string;
  type: 'character' | 'object' | 'action' | 'location' | 'magic';
  onInteract?: (word: string, type: string) => void;
  className?: string;
}

const typeStyles = {
  character: 'text-blue-500 hover:text-blue-600',
  object: 'text-amber-500 hover:text-amber-600',
  action: 'text-green-500 hover:text-green-600',
  location: 'text-purple-500 hover:text-purple-600',
  magic: 'text-pink-500 hover:text-pink-600',
};

const typeAnimations = {
  character: {
    hover: { scale: 1.1, y: -2 },
    tap: { scale: 0.95 },
    sparkle: { opacity: [0, 1, 0], scale: [1, 1.2, 0], y: -20 },
  },
  object: {
    hover: { scale: 1.05, rotate: [-1, 1, -1] },
    tap: { scale: 0.9 },
    sparkle: { opacity: [0, 1, 0], scale: [0.8, 1.1, 0.8], rotate: 360 },
  },
  action: {
    hover: { scale: 1.1, x: [0, 2, -2, 0] },
    tap: { scale: 0.95 },
    sparkle: { opacity: [0, 1, 0], x: [-10, 10], y: [-5, 5] },
  },
  location: {
    hover: { scale: 1.05, y: -1 },
    tap: { scale: 0.95 },
    sparkle: { opacity: [0, 1, 0], scale: [1, 1.5, 1], y: [-10, 0] },
  },
  magic: {
    hover: { scale: 1.1, filter: ['hue-rotate(0deg)', 'hue-rotate(360deg)'] },
    tap: { scale: 0.9 },
    sparkle: {
      opacity: [0, 1, 0],
      scale: [0.8, 1.2, 0.8],
      rotate: [0, 180, 360],
    },
  },
};

export default function InteractiveWord({
  word,
  type,
  onInteract,
  className,
}: InteractiveWordProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showSparkle, setShowSparkle] = useState(false);

  const handleClick = useCallback(() => {
    setShowSparkle(true);
    onInteract?.(word, type);

    // Reset sparkle animation after it completes
    setTimeout(() => setShowSparkle(false), 1000);
  }, [word, type, onInteract]);

  return (
    <motion.span
      className={cn(
        'relative inline-block cursor-pointer select-none',
        typeStyles[type],
        className
      )}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={handleClick}
      whileHover={typeAnimations[type].hover}
      whileTap={typeAnimations[type].tap}
    >
      {word}

      <AnimatePresence>
        {isHovered && (
          <motion.span
            className="absolute inset-0 border-b-2"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            style={{ borderColor: 'currentColor' }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSparkle && (
          <motion.div
            className="absolute left-0 right-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={typeAnimations[type].sparkle}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            {type === 'magic' ? (
              <span className="text-2xl">✨</span>
            ) : type === 'character' ? (
              <span className="text-xl">👤</span>
            ) : type === 'object' ? (
              <span className="text-xl">🎯</span>
            ) : type === 'action' ? (
              <span className="text-xl">⚡</span>
            ) : (
              <span className="text-xl">🌟</span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.span>
  );
}
