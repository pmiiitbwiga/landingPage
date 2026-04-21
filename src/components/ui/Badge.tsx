import { cn } from '@/src/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'primary' | 'accent' | 'outline';
}

function Badge({ className, variant = 'primary', ...props }: BadgeProps) {
  const variants = {
    primary: 'bg-primary text-white border-primary',
    accent: 'bg-accent text-primary border-accent',
    outline: 'border-line text-muted',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-tight transition-colors',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
