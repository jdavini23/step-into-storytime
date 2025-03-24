/** @jsxImportSource @emotion/react */
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Volume2,
  VolumeX,
  PauseCircle,
  PlayCircle,
} from 'lucide-react';
import { storyStyles } from './styles';
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
  className = '',
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

  return (
    <div className={`flex items-center gap-3 ${className}`} css={storyStyles.controls}>
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full hover:bg-slate-100"
        onClick={onPlayPause}
        style={themeColors ? {
          color: themeColors.primary,
          '--hover-color': `${themeColors.primary}10`,
        } as React.CSSProperties : undefined}
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
          className="hover:bg-slate-100"
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
          className="w-20 md:w-32 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
          style={themeColors ? {
            accentColor: themeColors.primary,
          } as React.CSSProperties : undefined}
        />
      </div>
    </div>
  );
}
