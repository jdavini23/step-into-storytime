'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Settings,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface StoryNarrationProps {
  audioUrl: string;
  storyText: string[];
  onHighlight?: (paragraphIndex: number) => void;
  className?: string;
}

const StoryNarration = ({
  audioUrl,
  storyText,
  onHighlight,
  className,
}: StoryNarrationProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState('1');
  const [currentParagraph, setCurrentParagraph] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = Number(playbackRate);
    }
  }, [playbackRate]);

  const playAudio = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      pauseAudio();
    } else {
      playAudio();
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(
        audioRef.current.currentTime + 10,
        duration
      );
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(
        audioRef.current.currentTime - 10,
        0
      );
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);

      // Find current paragraph based on timestamp
      const currentIndex = storyText.findIndex((_, index) => {
        const nextTimestamp = storyText[index + 1] ? index * 20 : Number.POSITIVE_INFINITY;
        return (
          audio.currentTime >= index * 20 && audio.currentTime < nextTimestamp
        );
      });

      if (currentIndex !== -1 && currentIndex !== currentParagraph) {
        setCurrentParagraph(currentIndex);
        if (onHighlight) {
          onHighlight(currentIndex);
        }
      }
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
    });

    return () => {
      audio.pause();
      audio.src = '';
      audio.removeEventListener('loadedmetadata', () => {});
      audio.removeEventListener('timeupdate', () => {});
      audio.removeEventListener('ended', () => {});
    };
  }, [audioUrl, onHighlight]);

  return (
    <div className={cn('story-narration', className)}>
      <audio ref={audioRef} src={audioUrl} onEnded={() => setIsPlaying(false)} />
      <div className="controls">
        <Button onClick={togglePlayPause}>
          {isPlaying ? <Pause /> : <Play />}
        </Button>
        <Slider value={[currentTime]} max={duration || 100} step={0.1} onValueChange={handleSeek} />
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-8 w-8 rounded-full',
            'text-muted-foreground hover:text-foreground',
            'transition-colors'
          )}
          onClick={toggleMute}
        >
          {isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
          <span className="sr-only">{isMuted ? 'Unmute' : 'Mute'}</span>
        </Button>
        <Slider value={[isMuted ? 0 : volume]} max={1} step={0.01} onValueChange={handleVolumeChange} />
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-8 w-8 rounded-full',
            'text-muted-foreground hover:text-foreground',
            'transition-colors'
          )}
          onClick={skipBackward}
        >
          <SkipBack className="h-4 w-4" />
          <span className="sr-only">Skip back 10 seconds</span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            'h-8 w-8 rounded-full',
            'text-muted-foreground hover:text-foreground',
            'transition-colors'
          )}
          onClick={skipForward}
        >
          <SkipForward className="h-4 w-4" />
          <span className="sr-only">Skip forward 10 seconds</span>
        </Button>
      </div>
      <div className="story-text">
        {storyText.map((paragraph, index) => (
          <p key={index} onClick={() => onHighlight && onHighlight(index)}>{paragraph}</p>
        ))}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'h-8 w-8',
              'text-muted-foreground hover:text-foreground',
              'transition-colors'
            )}
          >
            <Settings className="h-4 w-4" />
            <span className="sr-only">Settings</span>
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
};

export default StoryNarration;
