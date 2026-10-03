import { cn, formatNumber } from '@/lib/utils';

interface UsageMeterProps {
  label: string;
  used: number;
  /** null = unlimited */
  limit: number | null;
}

/** Labelled progress bar that turns red as the limit gets close. */
export function UsageMeter({ label, used, limit }: UsageMeterProps) {
  const percent = limit === null ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const tone = limit === null ? 'ok' : percent >= 100 ? 'full' : percent >= 85 ? 'near' : 'ok';
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <span className="text-sm font-medium text-ink">{label}</span>
        <span className="text-sm tabular-nums text-ink-soft">
          <span className="font-semibold text-ink">{formatNumber(used)}</span>
          {' / '}
          {limit === null ? 'Unlimited' : formatNumber(limit)}
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-paper-deep"
        role="progressbar"
        aria-label={label}
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={limit ?? undefined}
      >
        <div
          className={cn(
            'h-full rounded-full transition-[width] duration-500',
            tone === 'ok' ? 'bg-moss' : tone === 'near' ? 'bg-[#d9a400]' : 'bg-brand',
          )}
          style={{ width: `${limit === null ? 4 : Math.max(percent, used > 0 ? 2 : 0)}%` }}
        />
      </div>
      {tone !== 'ok' ? (
        <p
          className={cn(
            'mt-2 text-[13px] font-medium',
            tone === 'full' ? 'text-brand-dark' : 'text-butter-dark',
          )}
        >
          {tone === 'full'
            ? 'Limit reached. New DMs are paused until next month.'
            : 'You are close to your monthly limit.'}
        </p>
      ) : null}
    </div>
  );
}
