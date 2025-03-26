'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ThemeColors } from './types';

interface ActionControlsProps {
  onDownload?: () => void;
  onShare?: () => void;
  onSave?: () => Promise<void>;
  showSave?: boolean;
  themeColors: ThemeColors;
  className?: string;
}

export default function ActionControls({
  onDownload,
  onShare,
  onSave,
  showSave = true,
  themeColors,
  className,
}: ActionControlsProps) {
  const getThemeStyles = () => {
    return {
      '--theme-primary': themeColors.primary,
      '--theme-secondary': themeColors.secondary,
      '--theme-accent': themeColors.accent,
      '--theme-text': themeColors.text,
    } as React.CSSProperties;
  };

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      style={getThemeStyles()}
    >
      {onDownload && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onDownload}
          className={cn(
            'px-3 py-2 rounded-lg text-sm font-medium',
            'bg-[--theme-primary] text-[--theme-text]',
            'hover:bg-[--theme-primary]/90 transition-colors duration-200'
          )}
        >
          Download
        </motion.button>
      )}

      {onShare && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onShare}
          className={cn(
            'px-3 py-2 rounded-lg text-sm font-medium',
            'bg-[--theme-secondary] text-[--theme-text]',
            'hover:bg-[--theme-secondary]/90 transition-colors duration-200'
          )}
        >
          Share
        </motion.button>
      )}

      {showSave && onSave && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSave}
          className={cn(
            'px-3 py-2 rounded-lg text-sm font-medium',
            'bg-[--theme-accent] text-[--theme-text]',
            'hover:bg-[--theme-accent]/90 transition-colors duration-200'
          )}
        >
          Save
        </motion.button>
      )}
    </div>
  );
}
