/** @jsxImportSource @emotion/react */
'use client';

import { motion } from 'framer-motion';
import { ThemeColors } from './types';

interface ActionControlsProps {
  onDownload?: () => void;
  onShare?: () => void;
  onSave?: () => Promise<void>;
  showSave?: boolean;
  themeColors: ThemeColors;
}

export default function ActionControls({
  onDownload,
  onShare,
  onSave,
  showSave = true,
  themeColors,
}: ActionControlsProps) {
  return (
    <div className="flex items-center gap-2">
      {onDownload && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onDownload}
          className="px-3 py-2 rounded-lg text-sm font-medium"
          css={{
            backgroundColor: themeColors.primary,
            color: themeColors.text,
            '&:hover': {
              backgroundColor: themeColors.primaryHover,
            },
          }}
        >
          Download
        </motion.button>
      )}
      
      {onShare && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onShare}
          className="px-3 py-2 rounded-lg text-sm font-medium"
          css={{
            backgroundColor: themeColors.secondary,
            color: themeColors.text,
            '&:hover': {
              backgroundColor: themeColors.secondaryHover,
            },
          }}
        >
          Share
        </motion.button>
      )}

      {showSave && onSave && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onSave}
          className="px-3 py-2 rounded-lg text-sm font-medium"
          css={{
            backgroundColor: themeColors.accent,
            color: themeColors.text,
            '&:hover': {
              backgroundColor: themeColors.accentHover,
            },
          }}
        >
          Save
        </motion.button>
      )}
    </div>
  );
}
