import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Volume2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StoryData } from '@/lib/types';

interface StoryPreviewProps {
  storyData: Partial<StoryData>;
  className?: string;
}

export function StoryPreview({ storyData, className }: StoryPreviewProps) {
  const hasCharacter =
    storyData.character?.name && storyData.character?.traits?.length > 0;
  const hasSetting = storyData.setting;
  const hasTheme = storyData.theme;

  const PreviewSection = ({
    title,
    content,
    isComplete,
  }: {
    title: string;
    content: string;
    isComplete: boolean;
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3 p-4 rounded-lg bg-primary/5"
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <h4 className="font-medium text-primary/80">{title}</h4>
          {isComplete && <CheckCircle2 className="h-4 w-4 text-green-500" />}
        </div>
        <p className="text-muted-foreground mt-1">{content}</p>
      </div>
    </motion.div>
  );

  return (
    <Card className={cn('p-6 space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary">Story Preview</h3>
        <Button
          variant="outline"
          size="icon"
          disabled={!hasCharacter}
          className="rounded-full"
          title="Listen to story preview"
        >
          <Volume2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {hasCharacter && (
          <PreviewSection
            title="Our Hero"
            content={`Meet ${storyData.character?.name}${
              storyData.character?.traits?.length
                ? `, who is ${storyData.character.traits.join(' and ')}`
                : ''
            }.`}
            isComplete={true}
          />
        )}

        {hasSetting && (
          <PreviewSection
            title="The Setting"
            content={`Our story takes place in ${storyData.setting}.`}
            isComplete={true}
          />
        )}

        {hasTheme && (
          <PreviewSection
            title="The Theme"
            content={`This is a tale of ${storyData.theme}.`}
            isComplete={true}
          />
        )}

        {!hasCharacter && !hasSetting && !hasTheme && (
          <div className="flex items-center justify-center h-[200px] text-muted-foreground/70 text-center">
            Your story details will appear here as you create them...
          </div>
        )}
      </div>

      {(hasCharacter || hasSetting || hasTheme) && (
        <div className="pt-4 border-t border-primary/10">
          <Button
            className="w-full bg-primary/90 hover:bg-primary text-white rounded-full h-12 text-base font-medium transition-all duration-200"
            disabled={!hasCharacter || !hasSetting || !hasTheme}
          >
            <Play className="mr-2 h-5 w-5" />
            {!hasCharacter || !hasSetting || !hasTheme
              ? 'Complete all sections to generate'
              : 'Generate Story'}
          </Button>
        </div>
      )}
    </Card>
  );
}
