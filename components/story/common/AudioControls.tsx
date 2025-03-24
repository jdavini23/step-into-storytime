'use client';

import { VolumeIcon, Volume2Icon, PauseCircle, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AudioControlsProps } from './types';

export default function AudioControls({
  isPlaying,
  volume,
  onPlayPause,
  onVolumeChange,
}: AudioControlsProps) {
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full"
        onClick={onPlayPause}
      >
        {isPlaying ? (
          <PauseCircle className="h-6 w-6 text-violet-600" />
        ) : (
          <PlayCircle className="h-6 w-6 text-violet-600" />
        )}
        <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
      </Button>

      <div className="flex items-center gap-2">
        {volume > 0 ? (
          <Volume2Icon className="h-4 w-4 text-slate-500" />
        ) : (
          <VolumeIcon className="h-4 w-4 text-slate-500" />
        )}
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => onVolumeChange(Number.parseInt(e.target.value))}
          className="w-20 md:w-32 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
        />
      </div>
    </div>
  );
}
