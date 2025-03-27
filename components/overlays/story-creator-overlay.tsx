'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Sparkles } from 'lucide-react';

interface StoryCreatorOverlayProps {
  onComplete: () => void;
}

export default function StoryCreatorOverlay({
  onComplete,
}: StoryCreatorOverlayProps) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const storyLines = [
    'Once upon a time...',
    'In a magical universe...',
    'A new story begins...',
    'Just for you!',
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-violet-900/95 via-indigo-900/95 to-sky-900/95 flex items-center justify-center z-50"
    >
      <div className="text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Sparkles className="h-12 w-12 text-violet-400" />
        </motion.div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          {storyLines.map((line, index) => (
            <motion.p
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: currentTextIndex >= index ? 1 : 0,
                y: currentTextIndex >= index ? 0 : 20,
              }}
              onAnimationComplete={() => {
                if (index < storyLines.length - 1) {
                  setTimeout(() => setCurrentTextIndex(index + 1), 800);
                } else if (index === storyLines.length - 1) {
                  setTimeout(onComplete, 1000);
                }
              }}
              className="text-2xl md:text-4xl font-bold text-white"
            >
              {line}
            </motion.p>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
