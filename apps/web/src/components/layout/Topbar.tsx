'use client';

import { Menu, X } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { ApiRequestError } from '@/lib/api';
import { logout } from '@/lib/auth';
import { Brand } from './Brand';
import { NavLinks, UserCard } from './Sidebar';

/**
 * Phone header with a slide-down menu. On wider screens it renders nothing
 * visible, but still watches for an expired session.
 */
export function Topbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { error } = useCurrentUser();
  const [menuOpen, setMenuOpen] = useState(false);

  // The cookie can be present but expired; the API is the real judge.
  useEffect(() => {
    if (error instanceof ApiRequestError && error.status === 401) {
      void logout().catch(() => undefined);
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
    }
  }, [error, router]);

  // Close the menu whenever the page changes.
  useEffect(() => setMenuOpen(false), [pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur md:hidden">
      <div className="flex h-14 items-center justify-between gap-3 px-4">
        <Brand href="/dashboard" />
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-line-strong bg-white text-ink shadow-xs"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {menuOpen ? (
        <div className="max-h-[calc(100vh-3.5rem)] overflow-y-auto border-t border-line px-3 pb-4 pt-3 animate-fade-up">
          <NavLinks onNavigate={() => setMenuOpen(false)} />
          <div className="mt-4">
            <UserCard />
          </div>
        </div>
      ) : null}
    </header>
  );
}
