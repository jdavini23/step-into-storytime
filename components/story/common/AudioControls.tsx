/** @jsxImportSource @emotion/react */
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, VolumeX, PauseCircle, PlayCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeColors } from './types';

interface AudioControlsProps {
  onPlayPause?: () => void;
  onVolumeChange?: (volume: number) => void;
  isPlaying?: boolean;
  volume?: number;
  themeColors?: ThemeColors;
  className?: string;
}

export default function AudioControls({
  onPlayPause,
  onVolumeChange,
  isPlaying = false,
  volume = 70,
  themeColors,
  className,
}: AudioControlsProps) {
  const [isMuted, setIsMuted] = useState(false);
  const [previousVolume, setPreviousVolume] = useState(volume);

  const handleVolumeToggle = () => {
    if (isMuted) {
      setIsMuted(false);
      onVolumeChange?.(previousVolume);
    } else {
      setPreviousVolume(volume);
      setIsMuted(true);
      onVolumeChange?.(0);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value);
    if (newVolume > 0) {
      setIsMuted(false);
    }
    onVolumeChange?.(newVolume);
  };

  const getThemeStyles = () => {
    if (!themeColors) return {};
    return {
      '--theme-primary': themeColors.primary,
      '--theme-hover': `${themeColors.primary}10`,
    } as React.CSSProperties;
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-2 rounded-lg',
        'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
      style={getThemeStyles()}
    >
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          'h-10 w-10 rounded-full',
          'hover:bg-muted transition-colors duration-200',
          themeColors && 'text-[--theme-primary] hover:bg-[--theme-hover]'
        )}
        onClick={onPlayPause}
      >
        {isPlaying ? (
          <PauseCircle className="h-6 w-6" />
        ) : (
          <PlayCircle className="h-6 w-6" />
        )}
        <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
      </Button>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleVolumeToggle}
          className={cn(
            'hover:bg-muted transition-colors duration-200',
            themeColors && 'text-[--theme-primary] hover:bg-[--theme-hover]'
          )}
        >
          {isMuted || volume === 0 ? (
            <VolumeX className="h-5 w-5" />
          ) : (
            <Volume2 className="h-5 w-5" />
          )}
          <span className="sr-only">{isMuted ? 'Unmute' : 'Mute'}</span>
        </Button>

        <input
          type="range"
          min="0"
          max="100"
          value={isMuted ? 0 : volume}
          onChange={handleVolumeChange}
          className={cn(
            'w-20 md:w-32 h-2 rounded-lg appearance-none cursor-pointer',
            'bg-muted',
            themeColors && '[&::-webkit-slider-thumb]:bg-[--theme-primary]'
          )}
        />
      </div>
    </div>
  );
}
