import { AlertCircle, CheckCircle2, Info, TriangleAlert, type LucideIcon } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { controlClass } from './input';
import { Label } from './label';

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, rows = 3, ...props }, ref) => (
  <textarea
    ref={ref}
    rows={rows}
    className={cn(controlClass, 'resize-y py-2.5 leading-relaxed', className)}
    {...props}
  />
));
Textarea.displayName = 'Textarea';

/** Native select with a custom chevron, so it matches the inputs. */
export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      controlClass,
      'h-11 cursor-pointer appearance-none bg-[length:16px] bg-[right_0.75rem_center] bg-no-repeat pr-10',
      "bg-[url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2357524b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")]",
      className,
    )}
    {...props}
  />
));
Select.displayName = 'Select';

interface FieldProps {
  label: string;
  htmlFor?: string;
  /** Helper line under the label. */
  hint?: React.ReactNode;
  error?: string;
  /** Small text on the right of the label, e.g. "Optional". */
  aside?: string;
  className?: string;
  children: React.ReactNode;
}

/** Label + control + hint + error, stacked with consistent spacing. */
export function Field({ label, htmlFor, hint, error, aside, className, children }: FieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={htmlFor}>{label}</Label>
        {aside ? <span className="text-[13px] text-ink-soft">{aside}</span> : null}
      </div>
      {children}
      {hint && !error ? (
        <p className="text-[13px] leading-snug text-ink-soft [overflow-wrap:anywhere]">{hint}</p>
      ) : null}
      {error ? (
        <p
          role="alert"
          className="flex items-start gap-1.5 text-[13px] font-medium text-brand-dark"
        >
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : null}
    </div>
  );
}

const BADGE_TONES = {
  neutral: 'bg-ink/[0.06] text-ink-soft',
  green: 'bg-moss-tint text-moss-dark',
  red: 'bg-brand-tint text-brand-dark',
  yellow: 'bg-butter-tint text-butter-dark',
  blue: 'bg-sky-tint text-sky-dark',
} as const;

const DOT_TONES = {
  neutral: 'bg-ink-faint',
  green: 'bg-moss',
  red: 'bg-brand',
  yellow: 'bg-[#d9a400]',
  blue: 'bg-sky',
} as const;

export function Badge({
  tone = 'neutral',
  dot = false,
  className,
  children,
}: {
  tone?: keyof typeof BADGE_TONES;
  /** Show a small status dot before the text. */
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold',
        BADGE_TONES[tone],
        className,
      )}
    >
      {dot ? <span className={cn('h-1.5 w-1.5 rounded-full', DOT_TONES[tone])} /> : null}
      {children}
    </span>
  );
}

const NOTICE: Record<
  'info' | 'success' | 'error' | 'warning',
  { icon: LucideIcon; box: string; icon_: string }
> = {
  info: { icon: Info, box: 'border-sky/20 bg-sky-tint/70', icon_: 'text-sky' },
  success: { icon: CheckCircle2, box: 'border-moss/20 bg-moss-tint/80', icon_: 'text-moss' },
  error: { icon: AlertCircle, box: 'border-brand/25 bg-brand-tint/80', icon_: 'text-brand' },
  warning: {
    icon: TriangleAlert,
    box: 'border-[#d9a400]/30 bg-butter-tint',
    icon_: 'text-butter-dark',
  },
};

/** Inline message for results and problems. */
export function Notice({
  tone = 'info',
  className,
  children,
}: {
  tone?: keyof typeof NOTICE;
  className?: string;
  children: React.ReactNode;
}) {
  const { icon: Icon, box, icon_ } = NOTICE[tone];
  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-3 rounded-[10px] border px-4 py-3 text-sm text-ink animate-fade-up',
        box,
        className,
      )}
    >
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', icon_)} />
      <div className="min-w-0 flex-1 [overflow-wrap:anywhere]">{children}</div>
    </div>
  );
}

/** Shown when a list has nothing in it yet. */
export function EmptyState({
  icon: Icon,
  title,
  children,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center rounded-xl border border-dashed border-line-strong bg-white/60 px-6 py-12 text-center',
        className,
      )}
    >
      {Icon ? (
        <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-paper-deep text-ink-soft">
          <Icon className="h-5 w-5" />
        </span>
      ) : null}
      <p className="text-base font-semibold text-ink">{title}</p>
      {children ? (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-ink-soft">{children}</p>
      ) : null}
      {action ? <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div> : null}
    </div>
  );
}

/** Grey placeholder block shown while data loads. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-md bg-ink/[0.07]', className)} />;
}

/** A stack of skeleton rows for list pages. */
export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-label="Loading" role="status">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="rounded-xl border border-line bg-white p-5 shadow-soft">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="mt-3 h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}

/** Round switch, e.g. for turning an automation on and off. */
export function Toggle({
  checked,
  onChange,
  label,
  disabled,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        checked ? 'bg-moss' : 'bg-[#cfc7b9]',
      )}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 rounded-full bg-white shadow-xs transition-transform duration-200',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}
