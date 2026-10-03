import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';

/** Centered message card for public pages: not found, errors, confirmations. */
export function PublicMessage({
  icon: Icon,
  tone = 'neutral',
  eyebrow,
  title,
  children,
}: {
  icon: LucideIcon;
  tone?: 'neutral' | 'success';
  eyebrow?: string;
  title: string;
  children?: ReactNode;
}) {
  return (
    <Card className="mx-auto max-w-lg px-6 py-10 text-center sm:px-10">
      <span
        className={
          tone === 'success'
            ? 'mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-moss-tint text-moss'
            : 'mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-paper-deep text-ink-soft'
        }
      >
        <Icon className="h-5 w-5" />
      </span>
      {eyebrow ? (
        <p className="mt-5 text-[13px] font-semibold uppercase tracking-[0.08em] text-moss-dark">
          {eyebrow}
        </p>
      ) : null}
      <h1 className="mt-2 font-display text-[28px] font-medium leading-tight tracking-tight text-ink [overflow-wrap:anywhere]">
        {title}
      </h1>
      {children ? (
        <div className="mt-3 text-[15px] leading-relaxed text-ink-soft">{children}</div>
      ) : null}
    </Card>
  );
}
