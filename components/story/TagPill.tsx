import React from 'react';
import clsx from 'clsx';

interface TagPillProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export const TagPill: React.FC<TagPillProps> = ({ label, selected, onClick, className }) => (
  <span
    className={clsx(
      'px-4 py-1 rounded-full text-purple-700 bg-purple-100 border border-purple-200 transition cursor-pointer select-none',
      selected && 'bg-purple-200 text-purple-900 font-semibold shadow',
      className
    )}
    onClick={onClick}
    tabIndex={onClick ? 0 : undefined}
    role={onClick ? 'button' : undefined}
    aria-pressed={selected}
  >
    {label}
  </span>
);
