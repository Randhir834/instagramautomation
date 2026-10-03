'use client';

import { Instagram, Plus, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Avatar } from '@/components/layout/Brand';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge, EmptyState, ListSkeleton, Notice } from '@/components/ui/field';
import { useAccounts, useDisconnectAccount } from '@/hooks/useAccounts';
import { errorMessage } from '@/lib/api';
import { API_URL, formatDate, initials } from '@/lib/utils';

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

  const connectButton = (
    <Button asChild>
      <a href={CONNECT_URL}>
        <Plus /> Connect Instagram
      </a>
    </Button>
  );

  return (
    <>
      <PageHeader
        title="Instagram"
        description="Connect a Business or Creator account to start automating."
        actions={accounts && accounts.length > 0 ? connectButton : undefined}
      />

      {flash ? (
        <Notice tone={flash.tone} className="mb-5">
          {flash.text}
        </Notice>
      ) : null}
      {error ? <Notice tone="error">{errorMessage(error)}</Notice> : null}
      {disconnect.isError ? (
        <Notice tone="error" className="mb-5">
          {errorMessage(disconnect.error)}
        </Notice>
      ) : null}
      {isLoading ? <ListSkeleton rows={1} /> : null}

      {accounts && accounts.length === 0 ? (
        <EmptyState icon={Instagram} title="No account connected yet" action={connectButton}>
          You will log in on Instagram&apos;s own screen and approve access. We never see your
          password. Personal accounts cannot be connected; switching to Creator is free in Instagram
          settings.
        </EmptyState>
      ) : null}

      {accounts && accounts.length > 0 ? (
        <Card className="divide-y divide-line">
          {accounts.map((account) => (
            <div key={account.id} className="flex flex-wrap items-center justify-between gap-4 p-5">
              <div className="flex min-w-0 items-center gap-3.5">
                <Avatar
                  text={initials(account.username.replace(/[._]/g, ' '))}
                  className="h-11 w-11 bg-rose-tint text-rose-dark"
                />
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-ink [overflow-wrap:anywhere]">
                      @{account.username}
                    </span>
                    <Badge dot tone={account.isActive ? 'green' : 'red'}>
                      {account.isActive ? 'Connected' : 'Needs reconnecting'}
                    </Badge>
                  </p>
                  <p className="mt-0.5 text-[13px] text-ink-soft">
                    {account.isActive
                      ? `Connected ${formatDate(account.connectedAt)} · access renews automatically`
                      : 'Instagram stopped accepting this connection. Reconnect to resume.'}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {account.isActive ? null : (
                  <Button size="sm" asChild>
                    <a href={CONNECT_URL}>Reconnect</a>
                  </Button>
                )}
                <Button
                  variant="danger"
                  size="sm"
                  disabled={disconnect.isPending}
                  onClick={() => handleDisconnect(account.id, account.username)}
                >
                  Disconnect
                </Button>
              </div>
            </div>
          ))}
        </Card>
      ) : null}

      <div className="mt-6 flex items-start gap-3 rounded-xl bg-white/60 px-5 py-4 text-sm text-ink-soft ring-1 ring-line">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-moss" />
        <p>
          We connect through Instagram&apos;s official API. Your access token is encrypted before it
          is stored, and disconnecting deletes everything we hold for that account.
        </p>
      </div>
    </>
  );
}
