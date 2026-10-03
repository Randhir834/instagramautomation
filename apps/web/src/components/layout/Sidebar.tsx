'use client';

import {
  CalendarClock,
  CreditCard,
  FileText,
  Instagram,
  LayoutDashboard,
  ShoppingBag,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_NAME, cn } from '@/lib/utils';

export const NAV: { href: string; label: string; icon: LucideIcon }[] = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/accounts', label: 'Instagram', icon: Instagram },
  { href: '/automations', label: 'Automations', icon: Zap },
  { href: '/contacts', label: 'Contacts', icon: Users },
  { href: '/store', label: 'Store', icon: ShoppingBag },
  { href: '/bookings', label: 'Bookings', icon: CalendarClock },
  { href: '/invoices', label: 'Invoices', icon: FileText },
  { href: '/billing', label: 'Billing', icon: CreditCard },
];

/** The list of dashboard links. Used by the desktop sidebar and the phone menu. */
export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
              active ? 'bg-ink text-paper' : 'text-ink hover:bg-butter',
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

export function Wordmark() {
  return (
    <Link
      href="/dashboard"
      className="flex items-baseline gap-1 font-display text-xl font-semibold"
    >
      {APP_NAME}
      <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
    </Link>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-60 shrink-0 border-r-2 border-ink bg-white md:block">
      <div className="flex h-16 items-center border-b-2 border-ink px-5">
        <Wordmark />
      </div>
      <div className="p-3">
        <NavLinks />
      </div>
    </aside>
  );
}
