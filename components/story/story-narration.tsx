"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Settings } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface StoryNarrationProps {
  audioUrl: string
  storyText: string[]
  onHighlight?: (paragraphIndex: number) => void
}

export function StoryNarration({ audioUrl, storyText, onHighlight }: StoryNarrationProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState("1")
  const [currentParagraph, setCurrentParagraph] = useState(0)

  // Timestamps for each paragraph (in seconds)
  // In a real implementation, these would be generated or loaded
  const paragraphTimestamps = useRef(
    storyText.map((_, index) => index * 20), // Dummy timestamps
  )

  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio(audioUrl)
    audioRef.current = audio

    audio.addEventListener("loadedmetadata", () => {
      setDuration(audio.duration)
    })

    audio.addEventListener("timeupdate", () => {
      setCurrentTime(audio.currentTime)

      // Find current paragraph based on timestamp
      const currentIndex = paragraphTimestamps.current.findIndex((timestamp, index) => {
        const nextTimestamp = paragraphTimestamps.current[index + 1] || Number.POSITIVE_INFINITY
        return audio.currentTime >= timestamp && audio.currentTime < nextTimestamp
      })

      if (currentIndex !== -1 && currentIndex !== currentParagraph) {
        setCurrentParagraph(currentIndex)
        if (onHighlight) {
          onHighlight(currentIndex)
        }
      }
    })

    audio.addEventListener("ended", () => {
      setIsPlaying(false)
    })

    return () => {
      audio.pause()
      audio.src = ""
      audio.removeEventListener("loadedmetadata", () => {})
      audio.removeEventListener("timeupdate", () => {})
      audio.removeEventListener("ended", () => {})
    }
  }, [audioUrl, onHighlight])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume
    }
  }, [volume, isMuted])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = Number(playbackRate)
    }
  }, [playbackRate])

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0]
      setCurrentTime(value[0])
    }
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
  }

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 10, duration)
    }
  }

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 10, 0)
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-medium">
          Now playing: Paragraph {currentParagraph + 1} of {storyText.length}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Playback Speed</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuRadioGroup value={playbackRate} onValueChange={setPlaybackRate}>
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

      <div className="mb-4 flex items-center gap-2">
        <span className="text-xs text-muted-foreground w-10 text-right">{formatTime(currentTime)}</span>
        <Slider value={[currentTime]} max={duration || 100} step={0.1} onValueChange={handleSeek} className="flex-1" />
        <span className="text-xs text-muted-foreground w-10">{formatTime(duration)}</span>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={toggleMute}>
            {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
          </Button>
          <Slider
            value={[isMuted ? 0 : volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-24"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={skipBackward}>
            <SkipBack className="h-4 w-4" />
            <span className="sr-only">Skip back 10 seconds</span>
          </Button>

          <Button variant="default" size="icon" className="h-10 w-10 rounded-full bg-primary" onClick={togglePlayPause}>
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
            <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
          </Button>

          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={skipForward}>
            <SkipForward className="h-4 w-4" />
            <span className="sr-only">Skip forward 10 seconds</span>
          </Button>
        </div>
        <div className="w-[76px]"></div> {/* Spacer to balance layout */}
      </div>
    </div>
  )
}

