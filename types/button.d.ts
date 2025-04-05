import { ButtonHTMLAttributes } from 'react';

declare module '@/components/ui/button' {
  export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?:
      | 'default'
      | 'destructive'
      | 'outline'
      | 'secondary'
      | 'ghost'
      | 'link';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    asChild?: boolean;
  }
}
