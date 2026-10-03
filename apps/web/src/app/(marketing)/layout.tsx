import Link from 'next/link';
import type { ReactNode } from 'react';
import { PushButton } from '@/components/marketing/PushButton';
import { APP_NAME } from '@/lib/utils';

const NAV = [
  { href: '/#how', label: 'How it works' },
  { href: '/#features', label: "What's inside" },
  { href: '/pricing', label: 'Pricing' },
  { href: '/#faq', label: 'Questions' },
];

function Wordmark() {
  return (
    <Link href="/" className="flex items-baseline gap-1 font-display text-xl font-semibold">
      {APP_NAME}
      <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
    </Link>
  );
}

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="paper-grain flex min-h-screen flex-col overflow-x-clip bg-paper text-ink">
      <header className="sticky top-0 z-40 border-b-2 border-ink bg-paper/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Wordmark />
          <nav className="hidden items-center gap-1 text-sm md:flex">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-1.5 font-medium text-ink transition-colors hover:bg-butter"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4 text-sm">
            <Link
              href="/login"
              className="hidden rounded-lg px-3 py-1.5 font-medium text-ink transition-colors hover:bg-butter md:block"
            >
              Log in
            </Link>
            <PushButton href="/signup" size="sm">
              Start free
            </PushButton>
          </div>
        </div>
        {/* Phones: the same links, always visible under the bar */}
        <nav className="flex flex-wrap items-center justify-center gap-x-1 border-t border-ink/15 px-3 py-1.5 text-sm md:hidden">
          {[...NAV, { href: '/login', label: 'Log in' }].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-2.5 py-1.5 font-medium text-ink hover:bg-butter"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t-2 border-ink">
        <div className="container grid gap-8 py-12 sm:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <Wordmark />
            <p className="mt-3 max-w-xs text-sm text-ink/75">
              Comment replies, DMs, a small store, bookings and invoices. One login for the boring
              half of being a creator.
            </p>
          </div>
          <div className="text-sm">
            <p className="mb-3 font-medium">Product</p>
            <ul className="space-y-2 text-ink/75">
              <li>
                <Link href="/#how" className="hover:text-ink">
                  How it works
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-ink">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-ink">
                  Create an account
                </Link>
              </li>
            </ul>
          </div>
          <div className="text-sm">
            <p className="mb-3 font-medium">The legal bit</p>
            <ul className="space-y-2 text-ink/75">
              <li>
                <Link href="/privacy" className="hover:text-ink">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-ink">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/data-deletion" className="hover:text-ink">
                  Delete my data
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-ink/10">
          <p className="container py-5 text-xs text-ink/75">
            © {new Date().getFullYear()} {APP_NAME}. Not affiliated with Instagram or Meta.
          </p>
        </div>
      </footer>
    </div>
  );
}
