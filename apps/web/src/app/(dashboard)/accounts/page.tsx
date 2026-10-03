'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge, EmptyState, Notice } from '@/components/ui/field';
import { useAccounts, useDisconnectAccount } from '@/hooks/useAccounts';
import { errorMessage } from '@/lib/api';
import { API_URL, formatDate } from '@/lib/utils';

/** Full page navigation: the API redirects to Instagram's consent screen. */
const CONNECT_URL = `${API_URL}/instagram/connect`;

interface Flash {
  tone: 'success' | 'error' | 'warning';
  text: string;
}

/** Reads the result the API put in the URL after the Instagram redirect. */
function readFlash(): Flash | null {
  const params = new URLSearchParams(window.location.search);
  const error = params.get('error');
  const connected = params.get('connected');
  if (error) return { tone: 'error', text: error };
  if (connected && params.get('warning') === 'webhooks') {
    return {
      tone: 'warning',
      text: `@${connected} is connected, but Instagram did not confirm event delivery. Disconnect and connect again if automations do not fire.`,
    };
  }
  if (connected) return { tone: 'success', text: `@${connected} is connected.` };
  return null;
}

export default function AccountsPage() {
  const { data: accounts, isLoading, error } = useAccounts();
  const disconnect = useDisconnectAccount();
  const [flash, setFlash] = useState<Flash | null>(null);

  useEffect(() => {
    const found = readFlash();
    if (found) {
      setFlash(found);
      window.history.replaceState(null, '', window.location.pathname);
    }
  }, []);

  function handleDisconnect(id: string, username: string) {
    const ok = window.confirm(
      `Disconnect @${username}?\n\nThis permanently deletes its automations, contacts and message history.`,
    );
    if (ok) disconnect.mutate(id);
  }

  return (
    <>
      <PageHeader
        title="Instagram accounts"
        description="Connect a Business or Creator account to start automating."
        actions={
          <Button asChild>
            <a href={CONNECT_URL}>Connect Instagram</a>
          </Button>
        }
      />

      {flash ? (
        <Notice tone={flash.tone} className="mb-4">
          {flash.text}
        </Notice>
      ) : null}
      {error ? <Notice tone="error">{errorMessage(error)}</Notice> : null}
      {disconnect.isError ? (
        <Notice tone="error" className="mb-4">
          {errorMessage(disconnect.error)}
        </Notice>
      ) : null}
      {isLoading ? <p className="text-ink/75">Loading…</p> : null}

      {accounts && accounts.length === 0 ? (
        <EmptyState
          title="No account connected yet"
          action={
            <Button asChild>
              <a href={CONNECT_URL}>Connect Instagram</a>
            </Button>
          }
        >
          You will log in on Instagram&apos;s own screen and approve access. We never see your
          password. Personal accounts cannot be connected; switching to Creator is free in Instagram
          settings.
        </EmptyState>
      ) : null}

      <ul className="space-y-3">
        {accounts?.map((account) => (
          <li
            key={account.id}
            className="flex flex-wrap items-center justify-between gap-4 rounded-xl border-2 border-ink bg-white p-4"
          >
            <div className="min-w-0">
              <p className="flex flex-wrap items-center gap-2 font-semibold">
                <span className="break-all">@{account.username}</span>
                <Badge tone={account.isActive ? 'green' : 'red'}>
                  {account.isActive ? 'Connected' : 'Needs reconnecting'}
                </Badge>
              </p>
              <p className="mt-1 text-sm text-ink/75">
                {account.isActive
                  ? `Connected on ${formatDate(account.connectedAt)}. Access renews automatically.`
                  : 'Instagram stopped accepting this connection. Connect it again to resume.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {account.isActive ? null : (
                <Button size="sm" asChild>
                  <a href={CONNECT_URL}>Reconnect</a>
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                disabled={disconnect.isPending}
                onClick={() => handleDisconnect(account.id, account.username)}
              >
                Disconnect
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
