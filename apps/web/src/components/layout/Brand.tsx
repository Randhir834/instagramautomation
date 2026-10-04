import Link from 'next/link';
import { APP_NAME, cn } from '@/lib/utils';

/** The logo: a comment bubble with a send arrow inside (comment in, DM out). */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="8" className="fill-brand" />
      <path
        fill="#fff"
        d="M9 6.5h14a4.5 4.5 0 0 1 4.5 4.5v8.5A4.5 4.5 0 0 1 23 24h-8.6l-4.7 3.9c-.5.4-1.2 0-1.2-.6V24A4.5 4.5 0 0 1 4.5 19.5V11A4.5 4.5 0 0 1 9 6.5Z"
      />
      <path
        className="fill-brand"
        d="M10.2 14.6 21.9 10.1c.5-.2 1 .3.8.8l-4.4 11.3c-.2.5-.9.5-1.1 0l-1.9-4.3a.6.6 0 0 0-.3-.3l-4.8-1.9c-.5-.2-.5-.9 0-1.1Z"
      />
    </svg>
  );
}

/** The logo with the product name. Used in every header. */
export function Brand({ href = '/', className }: { href?: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        'inline-flex min-w-0 items-center gap-2 rounded-md font-display text-[17px] font-semibold leading-tight tracking-tight text-ink sm:text-[19px]',
        className,
      )}
    >
      <LogoMark className="h-7 w-7 shrink-0" />
      <span className="min-w-0">{APP_NAME}</span>
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
