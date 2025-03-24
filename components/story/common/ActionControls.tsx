'use client';

import { useState } from 'react';
import { Heart, Share2, Download, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ActionControlsProps } from './types';
import { getButtonStyle } from './styles';

export default function ActionControls({
  onDownload,
  onShare,
  onSave,
  onEdit,
  themeColors,
}: ActionControlsProps) {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {onDownload && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={onDownload}
                style={getButtonStyle(themeColors.primary, themeColors.primaryHover)}
              >
                <Download className="h-4 w-4" />
                <span className="sr-only">Download story</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download story</TooltipContent>
          </Tooltip>
        )}

        {onShare && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={onShare}
                style={getButtonStyle(themeColors.primary, themeColors.primaryHover)}
              >
                <Share2 className="h-4 w-4" />
                <span className="sr-only">Share story</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Share story</TooltipContent>
          </Tooltip>
        )}

        {onSave && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={() => {
                  setIsFavorite(!isFavorite);
                  onSave();
                }}
                style={getButtonStyle(
                  isFavorite ? themeColors.accent : themeColors.primary,
                  isFavorite ? themeColors.accentHover : themeColors.primaryHover
                )}
              >
                <Heart className="h-4 w-4" fill={isFavorite ? 'currentColor' : 'none'} />
                <span className="sr-only">{isFavorite ? 'Remove from favorites' : 'Add to favorites'}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isFavorite ? 'Remove from favorites' : 'Add to favorites'}</TooltipContent>
          </Tooltip>
        )}

        {onEdit && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full"
                onClick={onEdit}
                style={getButtonStyle(themeColors.primary, themeColors.primaryHover)}
              >
                <Printer className="h-4 w-4" />
                <span className="sr-only">Print story</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Print story</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
