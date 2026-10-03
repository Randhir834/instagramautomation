'use client';

import { RotateCcw } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

/** Shown if a page crashes, instead of a blank screen. */
export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center bg-paper px-5 py-16 text-center text-ink">
      <h1 className="font-display text-[32px] font-medium tracking-tight">Something went wrong</h1>
      <p className="mt-2 max-w-sm text-ink-soft">
        It’s not you. Try again, and if it keeps happening, refresh the page.
      </p>
      <Button className="mt-8" onClick={reset}>
        <RotateCcw /> Try again
      </Button>
    </div>
  );
}
