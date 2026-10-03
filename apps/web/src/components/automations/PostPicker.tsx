'use client';

import { Notice } from '@/components/ui/field';
import { useMedia } from '@/hooks/useAccounts';
import { cn } from '@/lib/utils';

interface PostPickerProps {
  igAccountId: string;
  /** null = the automation applies to all posts. */
  value: string | null;
  onChange: (postId: string | null) => void;
}

const tileClass = (selected: boolean) =>
  cn(
    'relative aspect-square overflow-hidden rounded-lg border-2 text-left transition-shadow',
    selected ? 'border-ink shadow-[0_4px_0_0_#1a1714]' : 'border-ink/25 hover:border-ink',
  );

/** Grid of the account's recent posts and reels, plus an "All posts" option. */
export function PostPicker({ igAccountId, value, onChange }: PostPickerProps) {
  const { data: media, isLoading, isError } = useMedia(igAccountId);

  return (
    <div>
      <button
        type="button"
        onClick={() => onChange(null)}
        aria-pressed={value === null}
        className={cn(
          'mb-3 flex w-full items-center justify-between gap-3 rounded-lg border-2 px-4 py-3 text-left font-semibold transition-shadow',
          value === null
            ? 'border-ink bg-butter shadow-[0_4px_0_0_#1a1714]'
            : 'border-ink/25 bg-white hover:border-ink',
        )}
      >
        All posts and reels
        {value === null ? (
          <span className="rounded bg-ink px-1.5 py-0.5 text-xs font-bold text-white">
            Selected
          </span>
        ) : null}
      </button>
      {media && media.length > 0 ? (
        <p className="mb-2 text-sm text-ink/75">Or pick one post:</p>
      ) : null}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {media?.map((item) => {
          const image = item.thumbnail_url ?? item.media_url;
          const selected = value === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              aria-pressed={selected}
              aria-label={item.caption ? `Post: ${item.caption.slice(0, 60)}` : 'Post'}
              className={cn(tileClass(selected), 'bg-moss-tint')}
            >
              {image ? (
                <img src={image} alt="" className="h-full w-full object-cover" />
              ) : (
                <span className="block p-2 text-xs font-medium leading-tight">
                  {item.caption?.slice(0, 60) || 'Post'}
                </span>
              )}
              {selected ? (
                <span className="absolute left-1 top-1 rounded bg-ink px-1.5 py-0.5 text-xs font-bold text-white">
                  Selected
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {isLoading ? <p className="mt-2 text-sm text-ink/75">Loading your posts…</p> : null}
      {isError ? (
        <Notice tone="warning" className="mt-3">
          Could not load your posts from Instagram right now. You can still use “All posts and
          reels”.
        </Notice>
      ) : null}
    </div>
  );
}
