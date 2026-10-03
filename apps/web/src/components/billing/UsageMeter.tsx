import { cn, formatNumber } from '@/lib/utils';

interface UsageMeterProps {
  label: string;
  used: number;
  /** null = unlimited */
  limit: number | null;
}

export function UsageMeter({ label, used, limit }: UsageMeterProps) {
  const percent = limit === null ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const nearLimit = limit !== null && percent >= 90;
  return (
    <div>
      <div className="mb-1.5 flex flex-wrap justify-between gap-x-3 text-sm">
        <span className="font-semibold">{label}</span>
        <span className="text-ink/75">
          {formatNumber(used)} of {limit === null ? 'unlimited' : formatNumber(limit)}
        </span>
      </div>
      <div
        className="h-3 overflow-hidden rounded-full border-2 border-ink bg-white"
        role="progressbar"
        aria-label={label}
        aria-valuenow={used}
        aria-valuemin={0}
        aria-valuemax={limit ?? undefined}
      >
        <div
          className={cn('h-full', nearLimit ? 'bg-brand' : 'bg-moss')}
          style={{ width: `${percent}%` }}
        />
      </div>
      {nearLimit ? (
        <p className="mt-1.5 text-sm font-medium text-brand-dark">
          {percent >= 100 ? 'Limit reached. New DMs are paused.' : 'You are close to your limit.'}
        </p>
      ) : null}
    </div>
  );
}
