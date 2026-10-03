'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface KeywordInputProps {
  id: string;
  value: string[];
  onChange: (keywords: string[]) => void;
  placeholder?: string;
  invalid?: boolean;
}

/** Type a word and press Enter (or comma) to add it as a chip. */
export function KeywordInput({ id, value, onChange, placeholder, invalid }: KeywordInputProps) {
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
    <div
      className={cn(
        'flex min-h-11 flex-wrap items-center gap-1.5 rounded-[10px] border bg-white px-2 py-1.5 shadow-xs transition-[border-color,box-shadow]',
        'focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/15',
        invalid ? 'border-brand ring-4 ring-brand/10' : 'border-line-strong hover:border-[#bfb6a6]',
      )}
    >
      {value.map((keyword) => (
        <span
          key={keyword}
          className="inline-flex items-center gap-1 rounded-md bg-butter-tint py-1 pl-2.5 pr-1 text-sm font-semibold text-ink ring-1 ring-inset ring-[#ecd48a]"
        >
          <span className="[overflow-wrap:anywhere]">{keyword}</span>
          <button
            type="button"
            onClick={() => onChange(value.filter((k) => k !== keyword))}
            aria-label={`Remove ${keyword}`}
            className="rounded p-0.5 text-ink-soft transition-colors hover:bg-white hover:text-ink"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        aria-invalid={invalid || undefined}
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
        placeholder={value.length ? 'Add another…' : placeholder}
        className="min-w-[8rem] flex-1 bg-transparent px-1.5 py-1 text-[15px] text-ink outline-none placeholder:text-ink-soft/70"
      />
    </div>
  );
}
