import { BookOpen, Calendar, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Story } from '@/lib/types';

interface StoryHeaderProps {
  title: string;
  author: string;
  date: string;
  theme: string;
  className?: string;
}

export default function StoryHeader({
  title,
  author,
  date,
  theme,
  className,
}: StoryHeaderProps) {
  return (
    <header className={cn('text-center md:text-left', className)}>
      <Badge
        variant="outline"
        className={cn(
          'mb-4 bg-primary/10 text-primary border-primary/20',
          'hover:bg-primary/20 hover:text-primary/90',
          'text-sm px-3 py-1 transition-colors'
        )}
      >
        {theme}
      </Badge>
      <h1
        className={cn(
          'text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight',
          'text-foreground dark:text-foreground/90',
          'transition-colors'
        )}
      >
        {title}
      </h1>
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-sm">
        <div className="flex items-center text-muted-foreground">
          <User className="h-4 w-4 mr-2 text-primary" />
          <span className="font-medium">{author}</span>
        </div>
        <div className="flex items-center text-muted-foreground">
          <Calendar className="h-4 w-4 mr-2 text-primary" />
          <span>{date}</span>
        </div>
        <div className="flex items-center text-muted-foreground">
          <BookOpen className="h-4 w-4 mr-2 text-primary" />
          <span>5 minute read</span>
        </div>
      </div>
    </header>
  );
}
