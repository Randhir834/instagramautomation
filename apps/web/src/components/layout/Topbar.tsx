'use client';

import { useQueryClient } from '@tanstack/react-query';
import { LogOut, Menu, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/field';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ApiRequestError } from '@/lib/api';
import { logout } from '@/lib/auth';
import { NavLinks, Wordmark } from './Sidebar';

export function Topbar() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, error } = useCurrentUser();
  const [menuOpen, setMenuOpen] = useState(false);

  // The cookie can be present but expired; the API is the real judge.
  useEffect(() => {
    if (error instanceof ApiRequestError && error.status === 401) {
      void logout().catch(() => undefined);
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [error, router]);

  async function handleLogout() {
    await logout().catch(() => undefined);
    queryClient.clear();
    router.push('/login');
  }

  return (
    <header className="border-b-2 border-ink bg-white">
      <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-3 md:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="flex h-10 w-10 items-center justify-center rounded-lg border-2 border-ink bg-white"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <Wordmark />
        </div>

        <div className="hidden min-w-0 items-center gap-2 text-sm md:flex">
          {user ? (
            <>
              <span className="font-semibold">{user.name}</span>
              <Badge tone={user.plan === 'FREE' ? 'neutral' : 'yellow'}>{user.plan}</Badge>
            </>
          ) : null}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="hidden md:inline-flex"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </Button>
      </div>

      {menuOpen ? (
        <div className="border-t-2 border-ink p-3 md:hidden">
          <NavLinks onNavigate={() => setMenuOpen(false)} />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t-2 border-ink/15 pt-3">
            {user ? <span className="break-all text-sm font-semibold">{user.name}</span> : null}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Log out
            </Button>
          </div>
        </div>
      ) : null}
    </header>
  );
}
