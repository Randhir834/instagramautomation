import Link from 'next/link';
import type { ReactNode } from 'react';
import { Brand } from '@/components/layout/Brand';
import { PushButton } from '@/components/marketing/PushButton';
import { APP_NAME } from '@/lib/utils';

const NAV = [
  { href: '/#how', label: 'How it works' },
  { href: '/#features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/#faq', label: 'FAQ' },
  { href: '/contact', label: 'Contact' },
];

const FOOTER = [
  {
    title: 'Product',
    links: [
      { href: '/#how', label: 'How it works' },
      { href: '/#features', label: 'Features' },
      { href: '/pricing', label: 'Pricing' },
    ],
  },
  {
    title: 'Get started',
    links: [
      { href: '/signup', label: 'Create an account' },
      { href: '/login', label: 'Log in' },
      { href: '/contact', label: 'Contact us' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { href: '/privacy', label: 'Privacy' },
      { href: '/terms', label: 'Terms' },
      { href: '/data-deletion', label: 'Delete my data' },
    ],
  },
];

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-paper text-ink">
      <header className="sticky top-0 z-40 border-b border-line/80 bg-paper/85 backdrop-blur-md">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Brand />
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition-colors hover:bg-white hover:text-ink"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-ink transition-colors hover:bg-white lg:block"
            >
              Log in
            </Link>
            <PushButton href="/signup" size="sm" className="hidden min-[360px]:inline-flex">
              Start free
            </PushButton>
          </div>
        </div>
        {/* Phones: the same links in a row under the bar */}
        <nav
          className="flex flex-wrap items-center justify-center gap-x-1 border-t border-line/80 px-3 py-1 lg:hidden"
          aria-label="Main"
        >
          {[...NAV, { href: '/login', label: 'Log in' }].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-lg px-2.5 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-line bg-white">
        <div className="container grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="sm:col-span-2 lg:col-span-1">
            <Brand />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-soft">
              Comment replies, DMs, a small store, bookings and invoices. One place for the busy
              half of being a creator.
            </p>
          </div>
          {FOOTER.map((group) => (
            <div key={group.title}>
              <p className="text-sm font-semibold text-ink">{group.title}</p>
              <ul className="mt-3 space-y-2.5 text-sm">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-ink-soft transition-colors hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-line">
          <p className="container py-5 text-[13px] text-ink-soft">
            © {APP_NAME}. All rights reserved. Not affiliated with Instagram or Meta.
          </p>
        </div>
      </footer>
    </div>
  );
}
