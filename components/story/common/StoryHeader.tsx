'use client';

import { BookOpen, Calendar, User, ChevronLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StoryHeaderProps } from './types';
import { getButtonStyle, getBadgeStyle } from './styles';

export default function StoryHeader({
  title,
  author,
  date,
  theme,
  themeColors,
}: StoryHeaderProps) {
  return (
    <header className="relative text-center md:text-left">
      <Badge
        variant="outline"
        className="mb-4 text-sm px-3 py-1"
        style={getBadgeStyle(themeColors)}
      >
        {theme}
      </Badge>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight" style={{ color: themeColors.text }}>
        {title}
      </h1>
      <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-sm" style={{ color: themeColors.text }}>
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2" style={{ color: themeColors.primary }} />
          <span className="font-medium">{author}</span>
        </div>
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2" style={{ color: themeColors.primary }} />
          <span>{date}</span>
        </div>
        <div className="flex items-center">
          <BookOpen className="h-4 w-4 mr-2" style={{ color: themeColors.primary }} />
          <span>5 minute read</span>
        </div>
      </div>
    </header>
  );
}
