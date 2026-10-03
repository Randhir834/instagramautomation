'use client';

import { useState } from 'react';

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
    <div className="slab rounded-3xl bg-white p-5 sm:p-7">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-ink/75">This automation listens for</span>
        {KEYWORDS.map((k) => (
          <span
            key={k}
            className={`rounded-md border-2 px-2.5 py-0.5 font-semibold transition-colors ${
              matched === k ? 'border-ink bg-butter' : 'border-ink/25 text-ink/75'
            }`}
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
        className="mt-2 w-full rounded-xl border-2 border-ink bg-paper px-3 py-3 text-base outline-none placeholder:text-ink/60 focus:bg-white focus:ring-4 focus:ring-sky/30"
      />
      <div className="mt-2 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setComment(s)}
            className="rounded-lg border-2 border-ink bg-paper px-2.5 py-1 text-xs font-semibold shadow-[0_2px_0_0_#1a1714] transition-[transform,box-shadow] duration-100 hover:bg-butter active:translate-y-[2px] active:shadow-none"
          >
            {s}
          </button>
        ))}
      </div>

      <div
        className="mt-6 min-h-[9.5rem] border-t border-dashed border-ink/25 pt-5"
        aria-live="polite"
      >
        {isEmpty ? (
          <p className="text-sm text-ink/75">Waiting for a comment.</p>
        ) : matched ? (
          <ol className="space-y-3 text-sm">
            <li className="flex gap-3">
              <span className="mt-0.5 font-display text-brand">1</span>
              <p>
                <span className="text-ink/75">Public reply under the comment</span>
                <span className="mt-1 block w-fit rounded-lg bg-paper px-3 py-1.5">
                  Sent it to your DMs!
                </span>
              </p>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 font-display text-brand">2</span>
              <p>
                <span className="text-ink/75">Private message</span>
                <span className="mt-1 block w-fit rounded-2xl rounded-bl-sm bg-sky px-3 py-1.5 text-white">
                  {matched === 'recipe'
                    ? 'Here is the full recipe card. Want the shopping list too?'
                    : 'Here you go. It is ₹499 and the link is below.'}
                </span>
              </p>
            </li>
          </ol>
        ) : (
          <div className="text-sm">
            <p className="font-medium">Nothing is sent.</p>
            <p className="mt-1 max-w-sm text-ink/75">
              No keyword in that comment, so the automation stays quiet. Your followers only hear
              from you when they asked to.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
