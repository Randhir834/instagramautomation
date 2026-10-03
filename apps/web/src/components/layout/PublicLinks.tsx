'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Field, Notice } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useCurrentUser, useUpdateProfile } from '@/hooks/useCurrentUser';
import { errorMessage } from '@/lib/api';
import { WEB_URL } from '@/lib/utils';

function CopyRow({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border-2 border-ink/15 bg-paper px-3 py-2">
      <div className="min-w-0">
        <p className="text-xs font-bold uppercase tracking-wide text-ink/75">{label}</p>
        <a href={url} target="_blank" rel="noreferrer" className="break-all text-sm underline">
          {url}
        </a>
      </div>
      <Button variant="outline" size="sm" onClick={copy}>
        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        {copied ? 'Copied' : 'Copy'}
      </Button>
    </div>
  );
}

/** The creator's public URLs and the username they are built from. */
export function PublicLinks() {
  const { data: user } = useCurrentUser();
  const update = useUpdateProfile();
  const [username, setUsername] = useState<string | null>(null);
  if (!user) return null;

  const value = username ?? user.username;
  const changed = value !== user.username;

  return (
    <section className="rounded-xl border-2 border-ink bg-white p-5">
      <h2 className="font-display text-xl">Your public links</h2>
      <p className="mt-1 text-sm text-ink/75">Put these in your Instagram bio.</p>

      <div className="mt-4 space-y-2">
        <CopyRow label="Store" url={`${WEB_URL}/s/${user.username}`} />
        <CopyRow label="Book a call" url={`${WEB_URL}/book/${user.username}`} />
      </div>

      <form
        className="mt-5 flex flex-wrap items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          update.mutate({ username: value }, { onSuccess: () => setUsername(null) });
        }}
      >
        <Field
          label="Username in your links"
          htmlFor="username"
          hint="3 to 24 letters, numbers or underscores."
          className="min-w-0 flex-1 basis-56"
        >
          <Input
            id="username"
            value={value}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            autoComplete="off"
            spellCheck={false}
          />
        </Field>
        <Button type="submit" variant="secondary" disabled={!changed || update.isPending}>
          {update.isPending ? 'Saving…' : 'Save'}
        </Button>
      </form>
      {update.isError ? (
        <Notice tone="error" className="mt-3">
          {errorMessage(update.error)}
        </Notice>
      ) : null}
    </section>
  );
}
