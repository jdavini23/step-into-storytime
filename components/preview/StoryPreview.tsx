import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StoryData } from '@/lib/types';

interface StoryPreviewProps {
  storyData: Partial<StoryData>;
  className?: string;
}

export function StoryPreview({ storyData, className }: StoryPreviewProps) {
  const hasCharacter =
    storyData.character?.name && storyData.character?.traits?.length;
  const hasSetting = storyData.setting;
  const hasTheme = storyData.theme;

  return (
    <Card className={cn('p-6 space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Story Preview</h3>
        <Button
          variant="ghost"
          size="icon"
          disabled={!storyData.character?.name}
        >
          <Volume2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4 min-h-[200px]">
        {storyData.character?.name && storyData.character?.traits?.length && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h4 className="font-medium">Our Hero</h4>
            <p className="text-muted-foreground">
              Meet {storyData.character.name}
              {storyData.character.traits &&
                storyData.character.traits.length > 0 &&
                `, who is ${storyData.character.traits.join(' and ')}`}
              .
            </p>
          </motion.div>
        )}

        {hasSetting && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h4 className="font-medium">The Setting</h4>
            <p className="text-muted-foreground">
              Our story takes place in {storyData.setting}.
            </p>
          </motion.div>
        )}

        {hasTheme && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-2"
          >
            <h4 className="font-medium">The Theme</h4>
            <p className="text-muted-foreground">
              This is a tale of {storyData.theme}.
            </p>
          </motion.div>
        )}

        {!hasCharacter && !hasSetting && !hasTheme && (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground">
            Your story will appear here as you create it...
          </div>
        )}
      </div>

      {storyData.character?.name && (
        <div className="pt-4 border-t">
          <Button
            className="w-full"
            disabled={!hasCharacter || !hasSetting || !hasTheme}
          >
            <Play className="mr-2 h-4 w-4" />
            Generate Story
          </Button>
        </div>
      )}
    </Card>
  );
}
