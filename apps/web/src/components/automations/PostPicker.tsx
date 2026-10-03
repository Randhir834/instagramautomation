'use client';

import { Check, Layers } from 'lucide-react';
import { Notice, Skeleton } from '@/components/ui/field';
import { useMedia } from '@/hooks/useAccounts';
import { cn } from '@/lib/utils';

interface PostPickerProps {
  igAccountId: string;
  /** null = the automation applies to all posts. */
  value: string | null;
  onChange: (postId: string | null) => void;
}

/** "All posts" option plus a grid of the account's recent posts and reels. */
export function PostPicker({ igAccountId, value, onChange }: PostPickerProps) {
  const { data: media, isLoading, isError } = useMedia(igAccountId);
  const allSelected = value === null;

  return (
    <div>
      <button
        type="button"
        onClick={() => onChange(null)}
        aria-pressed={allSelected}
        className={cn(
          'flex w-full items-center gap-3 rounded-[10px] border px-4 py-3 text-left transition-[border-color,background-color,box-shadow]',
          allSelected
            ? 'border-brand bg-brand-tint/50 ring-4 ring-brand/10'
            : 'border-line-strong bg-white hover:border-[#bfb6a6]',
        )}
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-ink-soft ring-1 ring-line">
          <Layers className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold text-ink">All posts and reels</span>
          <span className="block text-[13px] text-ink-soft">Including ones you publish later</span>
        </span>
        <span
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
            allSelected ? 'border-brand bg-brand text-white' : 'border-line-strong bg-white',
          )}
        >
          {allSelected ? <Check className="h-3 w-3" strokeWidth={3} /> : null}
        </span>
      </button>

      {isLoading ? (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="aspect-square rounded-lg" />
          ))}
        </div>
      ) : null}

      {media && media.length > 0 ? (
        <>
          <p className="mb-2 mt-4 text-[13px] font-medium text-ink-soft">Or only one post</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {media.map((item) => {
              const image = item.thumbnail_url ?? item.media_url;
              const selected = value === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onChange(item.id)}
                  aria-pressed={selected}
                  aria-label={item.caption ? `Post: ${item.caption.slice(0, 60)}` : 'Post'}
                  className={cn(
                    'relative aspect-square overflow-hidden rounded-lg border bg-moss-tint text-left transition-[box-shadow,border-color]',
                    selected
                      ? 'border-brand ring-4 ring-brand/20'
                      : 'border-line hover:border-line-strong',
                  )}
                >
                  {image ? (
                    <img src={image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="block p-2 text-xs font-medium leading-snug text-moss-dark">
                      {item.caption?.slice(0, 50) || 'Post'}
                    </span>
                  )}
                  {selected ? (
                    <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-white shadow-xs">
                      <Check className="h-3 w-3" strokeWidth={3} />
                      <span className="sr-only">Selected</span>
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      {isError ? (
        <Notice tone="warning" className="mt-3">
          Could not load your posts from Instagram right now. “All posts and reels” still works.
        </Notice>
      ) : null}
    </div>
  );
}
