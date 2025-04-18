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
          'text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight',
          'text-foreground dark:text-foreground/90',
          'transition-colors',
          'font-fredoka',
          'drop-shadow-[0_2px_12px_rgba(255,200,80,0.5)]',
          'animate-fadein'
        )}
        style={{
          textShadow: '0 0 16px #ffe066, 0 2px 8px #fff8dc',
        }}
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

/*
To use Fredoka, add this to your global CSS (e.g., globals.css):

@import url('https://fonts.googleapis.com/css2?family=Fredoka:wght@700;800&display=swap');

.font-fredoka {
  font-family: 'Fredoka', 'Comic Neue', 'Comic Sans MS', 'Arial Rounded MT Bold', Arial, sans-serif;
}
*/
