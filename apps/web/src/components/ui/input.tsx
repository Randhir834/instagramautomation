import * as React from 'react';
import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      ref={ref}
      className={cn(
        'w-full rounded-lg border-2 border-ink/25 bg-white px-3 py-2.5 text-base text-ink placeholder:text-ink/60 focus-visible:border-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky/25 disabled:cursor-not-allowed disabled:opacity-60',
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = 'Input';

export { Input };
