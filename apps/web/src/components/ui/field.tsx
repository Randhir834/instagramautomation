import * as React from 'react';
import { cn } from '@/lib/utils';
import { Label } from './label';

const controlClass =
  'w-full rounded-lg border-2 border-ink/25 bg-white px-3 py-2.5 text-base text-ink placeholder:text-ink/60 focus-visible:border-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky/25 disabled:cursor-not-allowed disabled:opacity-60';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, rows = 3, ...props }, ref) => (
  <textarea ref={ref} rows={rows} className={cn(controlClass, 'resize-y', className)} {...props} />
));
Textarea.displayName = 'Textarea';

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select ref={ref} className={cn(controlClass, 'pr-8', className)} {...props} />
));
Select.displayName = 'Select';

interface FieldProps {
  label: string;
  htmlFor?: string;
  /** Small helper line under the label. */
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

/** Label + control + hint + error, stacked. */
export function Field({ label, htmlFor, hint, error, className, children }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <Label htmlFor={htmlFor} className="text-sm font-semibold text-ink">
        {label}
      </Label>
      {hint ? <p className="text-sm text-ink/75 [overflow-wrap:anywhere]">{hint}</p> : null}
      {children}
      {error ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const BADGE_TONES = {
  neutral: 'bg-ink/10 text-ink',
  green: 'bg-moss text-white',
  red: 'bg-destructive text-white',
  yellow: 'bg-butter text-ink',
  blue: 'bg-sky text-white',
} as const;

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: keyof typeof BADGE_TONES;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-bold',
        BADGE_TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Coloured message box for results and problems. */
export function Notice({
  tone = 'info',
  className,
  children,
}: {
  tone?: 'info' | 'success' | 'error' | 'warning';
  className?: string;
  children: React.ReactNode;
}) {
  const tones = {
    info: 'border-sky bg-sky-tint text-ink',
    success: 'border-moss bg-moss-tint text-ink',
    error: 'border-destructive bg-brand-tint text-ink',
    warning: 'border-butter-dark bg-butter-tint text-ink',
  };
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('rounded-lg border-2 px-4 py-3 text-sm font-medium', tones[tone], className)}
    >
      {children}
    </div>
  );
}

/** Dashed box shown when a list has nothing in it yet. */
export function EmptyState({
  title,
  children,
  action,
}: {
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border-2 border-dashed border-ink/30 bg-white px-6 py-10 text-center">
      <p className="font-display text-xl text-ink">{title}</p>
      {children ? <p className="mx-auto mt-2 max-w-md text-sm text-ink/75">{children}</p> : null}
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}
