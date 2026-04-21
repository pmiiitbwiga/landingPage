import * as React from 'react';
import { cn } from '@/src/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const variants = {
      primary: 'bg-primary text-white hover:opacity-90',
      secondary: 'bg-accent text-primary hover:opacity-90 font-bold',
      outline: 'border border-line text-ink hover:bg-gray-50',
      ghost: 'hover:bg-gray-100 text-muted',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider',
      md: 'px-4 py-2 text-[12px] font-bold uppercase tracking-wider',
      lg: 'px-6 py-3 text-[14px] font-bold uppercase tracking-wider',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-[6px] transition-all focus:outline-none ring-accent/20 disabled:opacity-50 shrink-0',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button };
