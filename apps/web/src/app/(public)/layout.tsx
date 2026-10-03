import Link from 'next/link';
import type { ReactNode } from 'react';
import { APP_NAME } from '@/lib/utils';

/** Minimal chrome for pages followers see (store, booking, invoice, download). */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-paper text-ink">
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        {children}
      </main>
      <footer className="pb-8 text-center text-[13px] text-ink-soft">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 shadow-xs transition-colors hover:text-ink"
        >
          Made with <span className="font-semibold text-ink">{APP_NAME}</span>
        </Link>
      </footer>
    </div>
  );
}
