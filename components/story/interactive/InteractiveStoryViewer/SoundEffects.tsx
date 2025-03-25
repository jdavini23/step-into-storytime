'use client';

import { useRef, useCallback } from 'react';

// Define sound effect types and their corresponding audio files
const SOUND_EFFECTS = {
  magic: '/sounds/magic-sparkle.mp3',
  dragon: '/sounds/dragon-roar.mp3',
  fairy: '/sounds/fairy-chime.mp3',
  star: '/sounds/star-twinkle.mp3',
  wizard: '/sounds/wizard-spell.mp3',
  punctuation: '/sounds/pop.mp3',
  pageFlip: '/sounds/page-flip.mp3',
} as const;

type SoundEffectType = keyof typeof SOUND_EFFECTS;

export function useSoundEffects(volume: number, isMuted: boolean) {
  const audioRefs = useRef<{ [K in SoundEffectType]?: HTMLAudioElement }>({});

  // Preload sound effects
  const preloadAudio = useCallback((type: SoundEffectType) => {
    if (!audioRefs.current[type]) {
      const audio = new Audio(SOUND_EFFECTS[type]);
      audio.preload = 'auto';
      audioRefs.current[type] = audio;
    }
  }, []);

  // Play a sound effect
  const playSound = useCallback(
    (type: SoundEffectType) => {
      if (isMuted) return;

      if (!audioRefs.current[type]) {
        preloadAudio(type);
      }

      const audio = audioRefs.current[type];
      if (audio) {
        audio.volume = volume;
        audio.currentTime = 0;
        audio.play().catch((error) => {
          console.error('Error playing sound effect:', error);
        });
      }
    },
    [volume, isMuted, preloadAudio]
  );

  // Handle word-specific sound effects
  const handleWordEffect = useCallback(
    (word: string) => {
      const lowerWord = word.toLowerCase();

      if (lowerWord.includes('magic') || lowerWord.includes('spell')) {
        playSound('magic');
      } else if (lowerWord.includes('dragon')) {
        playSound('dragon');
      } else if (lowerWord.includes('fairy')) {
        playSound('fairy');
      } else if (lowerWord.includes('star')) {
        playSound('star');
      } else if (lowerWord.includes('wizard')) {
        playSound('wizard');
      } else if (/[!?.]$/.test(word)) {
        playSound('punctuation');
      }
    },
    [playSound]
  );

  // Play page flip sound
  const playPageFlip = useCallback(() => {
    playSound('pageFlip');
  }, [playSound]);

  return {
    handleWordEffect,
    playPageFlip,
  };
}
