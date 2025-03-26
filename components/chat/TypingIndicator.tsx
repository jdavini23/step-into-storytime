'use client';

import { forwardRef } from 'react';
import { motion } from 'framer-motion';

export const TypingIndicator = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div ref={ref} className="flex items-center space-x-1 p-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="h-2 w-2 bg-secondary rounded-full"
          animate={{
            y: ['0%', '-50%', '0%'],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </div>
  );
});
