'use client';

import { useQueryClient } from '@tanstack/react-query';
import {
  CalendarClock,
  CreditCard,
  FileText,
  Instagram,
  LayoutDashboard,
  LogOut,
  ShoppingBag,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/field';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { logout } from '@/lib/auth';
import { cn, initials } from '@/lib/utils';
import { Avatar, Brand } from './Brand';

const PLAN_LABEL = {
  FREE: 'Free plan',
  TRIAL: 'Trial',
  PREMIUM: 'Premium',
  PROFESSIONAL: 'Professional',
} as const;

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const NAV_GROUPS: { title?: string; items: NavItem[] }[] = [
  { items: [{ href: '/dashboard', label: 'Overview', icon: LayoutDashboard }] },
  {
    title: 'Automate',
    items: [
      { href: '/automations', label: 'Automations', icon: Zap },
      { href: '/contacts', label: 'Contacts', icon: Users },
      { href: '/accounts', label: 'Instagram', icon: Instagram },
    ],
  },
  {
    title: 'Earn',
    items: [
      { href: '/store', label: 'Store', icon: ShoppingBag },
      { href: '/bookings', label: 'Bookings', icon: CalendarClock },
      { href: '/invoices', label: 'Invoices', icon: FileText },
    ],
  },
  { title: 'Account', items: [{ href: '/billing', label: 'Plan & billing', icon: CreditCard }] },
];

/** All dashboard links, grouped. Used by the desktop sidebar and the phone menu. */
export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="space-y-5" aria-label="Main">
      {NAV_GROUPS.map((group, g) => (
        <div key={g}>
          {group.title ? (
            <p className="mb-1.5 px-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
              {group.title}
            </p>
          ) : null}
          <ul className="space-y-0.5">
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(`${href}/`);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={onNavigate}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                      active
                        ? 'bg-paper-deep font-semibold text-ink'
                        : 'font-medium text-ink-soft hover:bg-paper hover:text-ink',
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-[18px] w-[18px] shrink-0',
                        active ? 'text-brand' : 'text-ink-soft group-hover:text-ink',
                      )}
                      strokeWidth={active ? 2.25 : 2}
                    />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

/** Logged-in person, their plan, and a log-out button. */
export function UserCard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  async function handleLogout() {
    await logout().catch(() => undefined);
    queryClient.clear();
    router.push('/login');
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-line bg-paper/70 p-3">
      <Avatar text={user ? initials(user.name) : '…'} />
      <div className="min-w-0 flex-1">
        <p className="break-words text-sm font-semibold leading-snug text-ink">
          {user?.name ?? 'Loading…'}
        </p>
        {user ? (
          <Badge tone={user.plan === 'FREE' ? 'neutral' : 'yellow'} className="mt-0.5">
            {PLAN_LABEL[user.plan]}
          </Badge>
        ) : null}
      </div>
      <button
        type="button"
        onClick={handleLogout}
        aria-label="Log out"
        title="Log out"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-white hover:text-ink"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-line bg-white md:flex">
      <div className="flex h-16 items-center px-5">
        <Brand href="/dashboard" />
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <NavLinks />
      </div>
      <div className="p-3">
        <UserCard />
      </div>
    </aside>
  );
}
