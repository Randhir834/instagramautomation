import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const VARIANTS = {
  brand: 'bg-brand text-white [--edge:#1a1714]',
  butter: 'bg-butter text-ink [--edge:#1a1714]',
  paper: 'bg-paper text-ink [--edge:#1a1714]',
  white: 'bg-white text-ink [--edge:#1a1714]',
  ink: 'bg-ink text-paper [--edge:#c93a1e]',
} as const;

const SIZES = {
  sm: 'px-4 py-2 text-sm [--depth:3px]',
  md: 'px-6 py-3 text-base [--depth:5px]',
  lg: 'px-8 py-4 text-lg [--depth:6px]',
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

/**
 * The marketing site's button: a key you can press.
 * It sits on a solid edge, lifts a little on hover and sinks flat when clicked.
 */
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
        'group inline-flex select-none items-center justify-center gap-2 rounded-xl border-2 border-ink text-center font-bold leading-tight',
        'shadow-[0_var(--depth)_0_0_var(--edge)] transition-[transform,box-shadow] duration-100 ease-out',
        'hover:-translate-y-0.5 hover:shadow-[0_calc(var(--depth)+2px)_0_0_var(--edge)]',
        'active:translate-y-[var(--depth)] active:shadow-none',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky/40',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    >
      {children}
      {arrow ? (
        <ArrowRight
          className="h-[1.1em] w-[1.1em] shrink-0 transition-transform group-hover:translate-x-1"
          aria-hidden
        />
      ) : null}
    </Link>
  );
}
