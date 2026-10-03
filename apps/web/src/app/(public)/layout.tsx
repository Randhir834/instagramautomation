import Link from 'next/link';
import type { ReactNode } from 'react';
import { APP_NAME } from '@/lib/utils';

/** Minimal chrome for pages followers see (store, booking, invoice, download). */
export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <div className="paper-grain flex min-h-screen flex-col bg-paper text-ink">
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6">{children}</main>
      <footer className="py-6 text-center text-sm text-ink/75">
        Powered by{' '}
        <Link href="/" className="font-semibold text-ink underline underline-offset-4">
          {APP_NAME}
        </Link>
      </footer>
    </div>
  );
}
