import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/styles';
import { ThemeColors } from '../common/types';
import AudioControls from '../common/AudioControls';
import NavigationControls from '../common/NavigationControls';
import ActionControls from '../common/ActionControls';
import { PreviewAction } from './hooks/usePreviewState';

interface PreviewControlsProps {
  state: {
    currentPage: number;
    autoPlayEnabled: boolean;
  };
  dispatch: (action: PreviewAction) => void;
  totalPages: number;
  storyTitle: string;
  story: string;
  onSave?: () => Promise<void>;
  themeColors: ThemeColors;
  className?: string;
}

export default function PreviewControls({
  state,
  dispatch,
  totalPages,
  storyTitle,
  story,
  onSave,
  themeColors,
  className,
}: PreviewControlsProps) {
  const handleDownload = useCallback(() => {
    const blob = new Blob([story], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${storyTitle.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [story, storyTitle]);

  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator
        .share({
          title: storyTitle,
          text: 'Check out this story I created with Step Into Storytime!',
          url: window.location.href,
        })
        .catch((error) => console.log('Error sharing:', error));
    } else {
      alert(
        'Sharing is not supported in your browser. You can copy the URL manually.'
      );
    }
  }, [storyTitle]);

  return (
    <div
      className={cn(
        'flex flex-col md:flex-row items-center justify-between gap-4 p-4',
        'border-t border-border/10 bg-card/50',
        'transition-colors',
        className
      )}
    >
      <AudioControls
        isPlaying={state.autoPlayEnabled}
        onPlayPause={() =>
          dispatch({
            type: 'TOGGLE_AUTO_PLAY',
            payload: !state.autoPlayEnabled,
          })
        }
        onVolumeChange={(volume: number) =>
          dispatch({ type: 'TOGGLE_SOUND', payload: volume > 0 })
        }
        themeColors={themeColors}
        className={cn(
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          'text-muted-foreground hover:text-foreground'
        )}
      />

      <NavigationControls
        currentPage={state.currentPage}
        totalPages={totalPages}
        onPrevious={() =>
          dispatch({ type: 'SET_PAGE', payload: state.currentPage - 1 })
        }
        onNext={() =>
          dispatch({ type: 'SET_PAGE', payload: state.currentPage + 1 })
        }
        themeColors={themeColors}
        className={cn('flex items-center gap-2', 'text-muted-foreground')}
      />

      <ActionControls
        onDownload={handleDownload}
        onShare={handleShare}
        onSave={onSave}
        showSave={!!onSave}
        themeColors={themeColors}
        className={cn(
          'flex items-center gap-2',
          buttonVariants({ variant: 'ghost', size: 'sm' }),
          'text-muted-foreground hover:text-foreground'
        )}
      />
    </div>
  );
}
