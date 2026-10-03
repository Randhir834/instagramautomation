'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

interface KeywordInputProps {
  id: string;
  value: string[];
  onChange: (keywords: string[]) => void;
  placeholder?: string;
}

/** Type a word and press Enter (or comma) to add it as a chip. */
export function KeywordInput({ id, value, onChange, placeholder }: KeywordInputProps) {
  const [draft, setDraft] = useState('');

  function commit(text: string) {
    const words = text
      .split(',')
      .map((w) => w.trim().toLowerCase())
      .filter((w) => w && !value.includes(w));
    if (words.length) onChange([...value, ...words]);
    setDraft('');
  }

  return (
    <div className="rounded-lg border-2 border-ink/25 bg-white p-2 focus-within:border-ink focus-within:ring-4 focus-within:ring-sky/25">
      <div className="flex flex-wrap gap-2">
        {value.map((keyword) => (
          <span
            key={keyword}
            className="flex items-center gap-1 rounded-md border-2 border-ink bg-butter py-0.5 pl-2 pr-1 text-sm font-semibold"
          >
            <span className="break-all">{keyword}</span>
            <button
              type="button"
              onClick={() => onChange(value.filter((k) => k !== keyword))}
              aria-label={`Remove ${keyword}`}
              className="rounded p-0.5 hover:bg-ink hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </span>
        ))}
        <input
          id={id}
          value={draft}
          onChange={(e) => {
            if (e.target.value.includes(',')) commit(e.target.value);
            else setDraft(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              commit(draft);
            } else if (e.key === 'Backspace' && !draft && value.length) {
              onChange(value.slice(0, -1));
            }
          }}
          onBlur={() => commit(draft)}
          placeholder={value.length ? '' : placeholder}
          className="min-w-[8rem] flex-1 bg-transparent px-1 py-1 text-base text-ink outline-none placeholder:text-ink/60"
        />
      </div>
    </div>
  );
}
