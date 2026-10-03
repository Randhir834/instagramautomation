'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

const KEYWORDS = ['price', 'link', 'recipe'];
const SUGGESTIONS = ['PRICE?', 'omg link please', 'this looks amazing', 'Recipe!!'];

/** Same rule the product uses for "contains" matching: case and spacing do not matter. */
function findKeyword(comment: string): string | null {
  const text = comment.trim().toLowerCase().replace(/\s+/g, ' ');
  return KEYWORDS.find((k) => text.includes(k)) ?? null;
}

export function KeywordDemo() {
  const [comment, setComment] = useState('PRICE?');
  const matched = findKeyword(comment);
  const isEmpty = comment.trim() === '';

  return (
    <div className="rounded-2xl border border-line bg-white p-5 text-ink shadow-pop sm:p-7">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-ink-soft">This automation listens for</span>
        {KEYWORDS.map((k) => (
          <span
            key={k}
            className={cn(
              'rounded-md px-2.5 py-0.5 font-semibold transition-colors',
              matched === k
                ? 'bg-butter text-ink'
                : 'bg-paper text-ink-soft ring-1 ring-inset ring-line',
            )}
          >
            {k}
          </span>
        ))}
      </div>

      <label htmlFor="demo-comment" className="mt-6 block text-sm font-medium">
        Leave a comment, the way a follower would
      </label>
      <input
        id="demo-comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={80}
        autoComplete="off"
        placeholder="Type anything…"
        className="mt-2 h-12 w-full rounded-[10px] border border-line-strong bg-white px-3.5 text-base shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-ink-soft/70 focus:border-brand focus:ring-4 focus:ring-brand/15"
      />
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setComment(s)}
            className="rounded-full border border-line-strong bg-white px-3 py-1 text-xs font-medium text-ink transition-colors hover:border-ink hover:bg-paper"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-6 min-h-[9.5rem] border-t border-line pt-5" aria-live="polite">
        {isEmpty ? (
          <p className="text-sm text-ink-soft">Waiting for a comment.</p>
        ) : matched ? (
          <ol className="space-y-3.5 text-sm">
            <li className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
                1
              </span>
              <div>
                <p className="text-ink-soft">Public reply under the comment</p>
                <p className="mt-1 w-fit rounded-xl bg-paper px-3 py-1.5 ring-1 ring-line">
                  Sent it to your DMs!
                </p>
              </div>
            </li>
            <li className="flex gap-3">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
                2
              </span>
              <div>
                <p className="text-ink-soft">Private message</p>
                <p className="mt-1 w-fit rounded-2xl rounded-bl-md bg-sky px-3 py-1.5 text-white">
                  {matched === 'recipe'
                    ? 'Here is the full recipe card. Want the shopping list too?'
                    : 'Here you go. It is ₹499 and the link is below.'}
                </p>
              </div>
            </li>
          </ol>
        ) : (
          <div className="text-sm">
            <p className="font-semibold">Nothing is sent.</p>
            <p className="mt-1 max-w-sm text-ink-soft">
              No keyword in that comment, so the automation stays quiet. Followers only hear from
              you when they asked to.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
