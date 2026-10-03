import Link from 'next/link';
import { APP_NAME, cn } from '@/lib/utils';

/** The product name with its small mark. Used in every header. */
export function Brand({ href = '/', className }: { href?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-2 rounded-md font-display text-[19px] font-semibold tracking-tight text-ink',
        className,
      )}
    >
      <span
        aria-hidden
        className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-brand text-white shadow-xs"
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
          <path
            d="M4 6.5C4 5.1 5.1 4 6.5 4h7C14.9 4 16 5.1 16 6.5v4c0 1.4-1.1 2.5-2.5 2.5H9l-3.5 3v-3C4.7 12.7 4 11.7 4 10.5v-4Z"
            fill="currentColor"
          />
        </svg>
      </span>
      {APP_NAME}
    </Link>
  );
}

/** Circle with someone's initials. */
export function Avatar({ text, className }: { text: string; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-butter text-xs font-bold text-ink',
        className,
      )}
    >
      {text}
    </span>
  );
}
