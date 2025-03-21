'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, User } from 'lucide-react';

interface ChatMessageProps {
  message: string;
  type?: 'user' | 'system';
  icon?: React.ReactNode;
}

export default function ChatMessage({
  message,
  type = 'system',
  icon,
}: ChatMessageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center gap-3 ${
        type === 'user' ? 'justify-end' : 'justify-start'
      }`}
    >
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <div
        className={`rounded-lg p-4 ${
          type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
        }`}
      >
        {message}
      </div>
    </motion.div>
  );
}
