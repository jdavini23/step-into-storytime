'use client';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Edit } from 'lucide-react';
import { motion } from 'framer-motion';

interface WizardComponentProps {
  children?: React.ReactNode;
  className?: string;
}

export const WizardContainer = ({
  children,
  className,
}: WizardComponentProps) => (
  <div
    className={cn(
      'flex flex-col h-full max-h-[calc(100vh-4rem)] bg-background',
      'rounded-lg shadow-lg border border-border',
      className
    )}
  >
    {children}
  </div>
);

export const WizardHeader = ({ children, className }: WizardComponentProps) => (
  <header
    className={cn(
      'flex items-center justify-between p-4 border-b border-border',
      'bg-card text-card-foreground',
      className
    )}
  >
    {children}
  </header>
);

export const WizardProgress = ({ progress }: { progress: number }) => (
  <div className="px-4 py-2">
    <Progress value={progress} className="h-2" />
  </div>
);

export const WizardContent = ({
  children,
  className,
}: WizardComponentProps) => (
  <div
    className={cn(
      'flex-1 overflow-y-auto p-4',
      'scrollbar-thin scrollbar-thumb-rounded scrollbar-thumb-muted scrollbar-track-transparent',
      className
    )}
  >
    {children}
  </div>
);

export const MessageList = ({ children, className }: WizardComponentProps) => (
  <div className={cn('space-y-4', className)}>{children}</div>
);

export const SystemMessage = ({
  children,
  className,
}: WizardComponentProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className={cn('flex items-start gap-3 text-foreground', className)}
  >
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
      <Sparkles className="w-4 h-4 text-primary" />
    </div>
    <div className="flex-1 space-y-2">
      <div className="bg-muted p-4 rounded-lg text-muted-foreground">
        {children}
      </div>
    </div>
  </motion.div>
);

export const UserMessage = ({ children, className }: WizardComponentProps) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className={cn(
      'flex items-start gap-3 text-foreground justify-end',
      className
    )}
  >
    <div className="flex-1 space-y-2">
      <div className="bg-primary text-primary-foreground p-4 rounded-lg">
        {children}
      </div>
    </div>
  </motion.div>
);

export const InputContainer = ({
  children,
  className,
}: WizardComponentProps) => (
  <div className={cn('mt-4 space-y-2', className)}>{children}</div>
);

export const EditButton = ({
  onClick,
  className,
}: {
  onClick?: () => void;
  className?: string;
}) => (
  <Button
    variant="ghost"
    size="icon"
    onClick={onClick}
    className={cn('h-8 w-8 rounded-full hover:bg-muted', className)}
  >
    <Edit className="h-4 w-4" />
    <span className="sr-only">Edit</span>
  </Button>
);

export const WizardFooter = ({ children, className }: WizardComponentProps) => (
  <footer
    className={cn(
      'p-4 border-t border-border bg-card',
      'flex items-center justify-between gap-4',
      className
    )}
  >
    {children}
  </footer>
);
