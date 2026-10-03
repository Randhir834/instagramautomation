import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const VARIANTS = {
  brand:
    'bg-brand text-white shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_6px_16px_-6px_rgba(196,61,34,0.55)] hover:bg-brand-dark',
  ink: 'bg-ink text-white shadow-[0_6px_16px_-6px_rgba(28,25,23,0.5)] hover:bg-[#33302c]',
  white:
    'border border-line-strong bg-white text-ink shadow-xs hover:border-[#bfb6a6] hover:bg-paper',
  paper: 'bg-white text-ink shadow-[0_6px_16px_-6px_rgba(0,0,0,0.35)] hover:bg-paper',
} as const;

const SIZES = {
  sm: 'min-h-9 px-4 py-2 text-sm',
  md: 'min-h-11 px-5 py-2.5 text-[15px]',
  lg: 'min-h-12 px-6 py-3 text-base',
} as const;

interface PushButtonProps {
  href: string;
  children: ReactNode;
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
  /** Show a small arrow that nudges right on hover. */
  arrow?: boolean;
  className?: string;
}

/** Call-to-action link used across the marketing site. */
export function PushButton({
  href,
  children,
  variant = 'brand',
  size = 'md',
  arrow = false,
  className,
}: PushButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group inline-flex select-none items-center justify-center gap-2 rounded-[10px] text-center font-semibold leading-tight',
        'transition-[background-color,border-color,box-shadow,transform] duration-150 ease-out active:translate-y-px',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    >
      {children}
      {arrow ? (
        <ArrowRight
          className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:translate-x-0.5"
          aria-hidden
        />
      ) : null}
    </Link>
  );
}
