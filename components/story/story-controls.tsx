'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Heart,
  Share2,
  Download,
  Printer,
  VolumeIcon,
  Volume2Icon,
  PauseCircle,
  PlayCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useRouter } from 'next/navigation';
import styles from './story-controls.module.css';
import { cn } from '@/lib/utils';

export default function StoryControls() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [volume, setVolume] = useState(70);
  const router = useRouter();

  return (
    <div
      className={cn(styles['storybook-controls-bar'], 'p-4 md:p-6 relative')}
    >
      {/* Floating action buttons */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-4 z-10">
        <Button
          variant="default"
          size="lg"
          className="rounded-full px-6 py-3 font-bold text-lg bg-yellow-300 text-yellow-900 shadow-lg hover:bg-yellow-200 focus:ring-4 focus:ring-yellow-400 transition-all animate-glow animate-pop-on-hover"
          aria-label={isPlaying ? 'Pause narration' : 'Listen to story'}
          onClick={() => setIsPlaying(!isPlaying)}
        >
          <span className="inline-flex items-center gap-2">
            <span className="relative">
              {/* Star animation overlay */}
              <span className="absolute -top-2 -left-2 animate-twinkle text-yellow-400 text-2xl">
                ★
              </span>
              {isPlaying ? (
                <PauseCircle className="h-7 w-7 text-yellow-700 drop-shadow" />
              ) : (
                <PlayCircle className="h-7 w-7 text-yellow-700 drop-shadow" />
              )}
            </span>
            {isPlaying ? 'Pause' : 'Listen'}
          </span>
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="rounded-full px-6 py-3 font-bold text-lg bg-blue-200 text-blue-900 shadow hover:bg-blue-100 focus:ring-4 focus:ring-blue-300 transition-all animate-pop-on-hover"
          aria-label="Back to Stories"
          onClick={() => router.push('/dashboard')}
        >
          <ChevronLeft className="h-5 w-5 mr-2" /> Back to Stories
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="rounded-full px-6 py-3 font-bold text-lg bg-pink-200 text-pink-900 shadow hover:bg-pink-100 focus:ring-4 focus:ring-pink-300 transition-all animate-pop-on-hover"
          aria-label={
            isFavorite ? 'Remove from favorites' : 'Save to favorites'
          }
          onClick={() => setIsFavorite(!isFavorite)}
        >
          <Heart
            className={`h-5 w-5 mr-2 ${
              isFavorite ? 'fill-red-500 text-red-500' : 'text-pink-700'
            }`}
          />
          {isFavorite ? 'Saved' : 'Save'}
        </Button>
      </div>
      {/* Existing controls below */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Audio controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause narration' : 'Play narration'}
          >
            {isPlaying ? (
              <PauseCircle className="h-6 w-6 text-violet-600" />
            ) : (
              <PlayCircle className="h-6 w-6 text-violet-600" />
            )}
            <span className="sr-only">{isPlaying ? 'Pause' : 'Play'}</span>
          </Button>

          <div className="flex items-center gap-2">
            <VolumeIcon className="h-4 w-4 text-slate-500" />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(Number.parseInt(e.target.value))}
              className="w-20 md:w-32 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-violet-600"
              aria-label="Volume"
            />
            <Volume2Icon className="h-4 w-4 text-slate-500" />
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  onClick={() => setIsFavorite(!isFavorite)}
                  aria-label={
                    isFavorite ? 'Remove from favorites' : 'Add to favorites'
                  }
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isFavorite
                        ? 'fill-red-500 text-red-500'
                        : 'text-slate-600'
                    }`}
                  />
                  <span className="sr-only">Favorite</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                </p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  aria-label="Share story"
                >
                  <Share2 className="h-5 w-5 text-slate-600" />
                  <span className="sr-only">Share</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share story</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  aria-label="Download story"
                >
                  <Download className="h-5 w-5 text-slate-600" />
                  <span className="sr-only">Download</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Download story</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-full"
                  aria-label="Print story"
                >
                  <Printer className="h-5 w-5 text-slate-600" />
                  <span className="sr-only">Print</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Print story</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
