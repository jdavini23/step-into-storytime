"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
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
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function StoryControls() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [volume, setVolume] = useState(70)

  return (
    <div className="border-t border-slate-200 bg-slate-50 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Audio controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <PauseCircle className="h-6 w-6 text-violet-600" />
            ) : (
              <PlayCircle className="h-6 w-6 text-violet-600" />
            )}
            <span className="sr-only">{isPlaying ? "Pause" : "Play"}</span>
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
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500 text-red-500" : "text-slate-600"}`} />
                  <span className="sr-only">Favorite</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isFavorite ? "Remove from favorites" : "Add to favorites"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
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
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
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
                <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full">
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

        {/* Navigation buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <Button variant="outline" size="sm" className="gap-1">
            <ChevronLeft className="h-4 w-4" />
            Previous Story
          </Button>
          <Button variant="outline" size="sm" className="gap-1">
            Next Story
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

