'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import WordAnimator from './WordAnimator';

interface StoryTextRendererProps {
  text: string;
  isActive: boolean;
  onComplete?: () => void;
  onWordClick?: (word: string) => void;
  className?: string;
}

export default function StoryTextRenderer({
  text,
  isActive,
  onComplete,
  onWordClick,
  className,
}: StoryTextRendererProps) {
  const [words, setWords] = useState<string[]>([]);
  const [visibleWords, setVisibleWords] = useState<number>(0);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Split text into words, preserving punctuation
    const wordArray =
      text.match(/[\w\u00C0-\u017F]+|\s+|[^\w\s\u00C0-\u017F]/g) || [];
    setWords(wordArray);
    setVisibleWords(0);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text]);

  useEffect(() => {
    if (isActive && visibleWords < words.length) {
      timeoutRef.current = setTimeout(() => {
        setVisibleWords((prev) => {
          const next = prev + 1;
          if (next === words.length && onComplete) {
            onComplete();
          }
          return next;
        });
      }, 100); // Adjust timing as needed
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isActive, visibleWords, words.length, onComplete]);

  // Determine if a word should be interactive
  const isInteractiveWord = useCallback((word: string) => {
    // Make words interactive if they:
    // 1. Are longer than 5 characters
    // 2. Start with a capital letter
    // 3. End with !, ?, or .
    // 4. Are "special" words we want to animate
    return (
      word.length > 5 ||
      /^[A-Z]/.test(word) ||
      /[!?.]$/.test(word) ||
      /^(magic|dragon|star|wizard|fairy|sparkle)/i.test(word)
    );
  }, []);

  return (
    <div className={cn('space-x-1', className)}>
      <AnimatePresence>
        {words.map((word, index) => (
          <WordAnimator
            key={`${word}-${index}`}
            word={word}
            index={index}
            isVisible={index < visibleWords}
            isInteractive={isInteractiveWord(word)}
            onWordClick={onWordClick}
            className={cn(
              word.trim() === '' ? 'w-2' : '',
              index < visibleWords ? 'text-foreground' : 'text-transparent'
            )}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
