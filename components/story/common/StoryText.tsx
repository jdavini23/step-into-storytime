/** @jsxImportSource @emotion/react */
'use client';

import { motion } from 'framer-motion';
import type { FontSize, ThemeColors } from './types';

interface StoryTextProps {
  content: string;
  fontSize: FontSize;
  themeColors: ThemeColors;
}

export default function StoryText({ content, fontSize, themeColors }: StoryTextProps) {
  const fontSizes = {
    small: 'text-base',
    medium: 'text-lg',
    large: 'text-xl',
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`prose prose-slate max-w-none ${fontSizes[fontSize]}`}
      css={{
        color: themeColors.text,
        '& p': {
          marginBottom: '1.5em',
          lineHeight: 1.8,
        },
        '& strong': {
          color: themeColors.primary,
          fontWeight: 600,
        },
        '& em': {
          color: themeColors.accent,
          fontStyle: 'italic',
        },
      }}
    >
      {content.split('\n\n').map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </motion.div>
  );
}
