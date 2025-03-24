'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NavigationControlsProps } from './types';

export default function NavigationControls({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
}: NavigationControlsProps) {
  return (
    <div className="flex items-center gap-4">
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full"
        onClick={onPrevious}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-6 w-6 text-violet-600" />
        <span className="sr-only">Previous page</span>
      </Button>

      <span className="text-sm text-slate-600">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full"
        onClick={onNext}
        disabled={currentPage === totalPages}
      >
        <ChevronRight className="h-6 w-6 text-violet-600" />
        <span className="sr-only">Next page</span>
      </Button>
    </div>
  );
}
