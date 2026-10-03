import Link from 'next/link';
import type { ReactNode } from 'react';
import { APP_NAME } from '@/lib/utils';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="paper-grain flex min-h-screen flex-col items-center justify-center bg-paper px-4 py-10 text-ink">
      <Link href="/" className="mb-6 flex items-baseline gap-1 font-display text-2xl font-semibold">
        {APP_NAME}
        <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
      </Link>
      <div className="slab w-full max-w-sm rounded-2xl bg-white p-6 sm:p-8">{children}</div>
    </div>
  );
}
