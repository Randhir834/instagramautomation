import * as React from 'react';
import { cn } from '@/lib/utils';

/** Shared look of every text-like control (input, textarea, select). */
export const controlClass = cn(
  'w-full rounded-[10px] border border-line-strong bg-white px-3 text-[15px] text-ink shadow-xs',
  'placeholder:text-ink-soft/70',
  'transition-[border-color,box-shadow] duration-150',
  'hover:border-[#bfb6a6]',
  'focus-visible:border-brand focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/15',
  'disabled:cursor-not-allowed disabled:bg-paper disabled:text-ink-soft',
  'aria-[invalid=true]:border-brand aria-[invalid=true]:ring-4 aria-[invalid=true]:ring-brand/10',
);

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input type={type} ref={ref} className={cn(controlClass, 'h-11', className)} {...props} />
  ),
);
Input.displayName = 'Input';

export { Input };
