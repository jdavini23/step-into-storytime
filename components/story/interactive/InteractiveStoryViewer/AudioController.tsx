'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Volume2, VolumeX, Settings, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

interface AudioControllerProps {
  text: string;
  language: 'en' | 'es';
  onWordHighlight?: (index: number) => void;
  className?: string;
}

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

export default function AudioController({
  text,
  language,
  onWordHighlight,
  className,
}: AudioControllerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState('1');
  const [currentWord, setCurrentWord] = useState<number>(-1);
  const [wordTimestamps, setWordTimestamps] = useState<WordTimestamp[]>([]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speechSynthRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize speech synthesis
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'en' ? 'en-US' : 'es-ES';
      utterance.rate = Number(playbackRate);
      utterance.volume = isMuted ? 0 : volume;

      // Handle word boundaries
      utterance.onboundary = (event) => {
        if (event.name === 'word') {
          const wordIndex = event.charIndex;
          setCurrentWord(wordIndex);
          onWordHighlight?.(wordIndex);
        }
      };

      speechSynthRef.current = utterance;
    }

    return () => {
      if (speechSynthRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, [text, language, playbackRate, volume, isMuted, onWordHighlight]);

  const togglePlayPause = useCallback(() => {
    if (speechSynthRef.current) {
      if (isPlaying) {
        window.speechSynthesis.pause();
      } else {
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        } else {
          window.speechSynthesis.speak(speechSynthRef.current);
        }
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    if (speechSynthRef.current) {
      speechSynthRef.current.volume = newVolume;
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
    if (speechSynthRef.current) {
      speechSynthRef.current.volume = !isMuted ? 0 : volume;
    }
  }, [isMuted, volume]);

  return (
    <div
      className={cn(
        'flex items-center justify-between p-4',
        'bg-card/95 backdrop-blur-sm border rounded-lg shadow-sm',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={togglePlayPause}
          className="h-8 w-8"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          <span className="sr-only">
            {isPlaying ? 'Pause' : 'Play'} narration
          </span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMute}
            className="h-8 w-8"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
            <span className="sr-only">{isMuted ? 'Unmute' : 'Mute'}</span>
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-24"
          />
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Settings className="h-4 w-4" />
            <span className="sr-only">Narration settings</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Playback Speed</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup
            value={playbackRate}
            onValueChange={setPlaybackRate}
          >
            <DropdownMenuRadioItem value="0.5">0.5x</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="0.75">0.75x</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="1">Normal</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="1.25">1.25x</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="1.5">1.5x</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="2">2x</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
