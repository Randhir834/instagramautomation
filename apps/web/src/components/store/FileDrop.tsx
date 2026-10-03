'use client';

import { FileUp, X } from 'lucide-react';
import { useId, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface FileDropProps {
  id?: string;
  file: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  title: string;
  hint: string;
  invalid?: boolean;
}

/** A click-or-drop area for one file, showing the chosen file once picked. */
export function FileDrop({ id, file, onChange, accept, title, hint, invalid }: FileDropProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  if (file) {
    return (
      <div className="flex items-center gap-3 rounded-[10px] border border-line-strong bg-white px-4 py-3 shadow-xs">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-moss-tint text-moss-dark">
          <FileUp className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink [overflow-wrap:anywhere]">{file.name}</p>
          <p className="text-[13px] text-ink-soft">{formatSize(file.size)}</p>
        </div>
        <button
          type="button"
          onClick={() => {
            onChange(null);
            if (inputRef.current) inputRef.current.value = '';
          }}
          aria-label={`Remove ${file.name}`}
          className="rounded-md p-1.5 text-ink-soft transition-colors hover:bg-paper hover:text-ink"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <label
      htmlFor={inputId}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const dropped = e.dataTransfer.files[0];
        if (dropped) onChange(dropped);
      }}
      className={cn(
        'flex cursor-pointer flex-col items-center rounded-[10px] border border-dashed px-4 py-6 text-center transition-colors',
        dragging
          ? 'border-brand bg-brand-tint/40'
          : invalid
            ? 'border-brand bg-white'
            : 'border-line-strong bg-white hover:border-ink/40 hover:bg-paper/50',
      )}
    >
      <FileUp className="h-5 w-5 text-ink-soft" />
      <span className="mt-2 text-sm font-semibold text-ink">{title}</span>
      <span className="mt-0.5 text-[13px] text-ink-soft">{hint}</span>
      <input
        ref={inputRef}
        id={inputId}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
    </label>
  );
}
