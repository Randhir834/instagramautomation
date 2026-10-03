'use client';

import { Check, Copy, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Field, Notice } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useCurrentUser, useUpdateProfile } from '@/hooks/useCurrentUser';
import { errorMessage } from '@/lib/api';
import { WEB_URL } from '@/lib/utils';

function LinkRow({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{label}</p>
        <p className="text-[13px] text-ink-soft [overflow-wrap:anywhere]">{url}</p>
      </div>
      <div className="flex gap-1.5">
        <Button variant="outline" size="sm" onClick={copy} aria-label={`Copy ${label} link`}>
          {copied ? <Check /> : <Copy />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
        <Button variant="ghost" size="icon" asChild>
          <a href={url} target="_blank" rel="noreferrer" aria-label={`Open ${label}`}>
            <ExternalLink />
          </a>
        </Button>
      </div>
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
    <Card>
      <CardHeader
        title="Your link-in-bio pages"
        description="Share these anywhere: bio, stories, DMs."
      />
      <CardContent>
        <div className="divide-y divide-line">
          <LinkRow label="Store" url={`${WEB_URL}/s/${user.username}`} />
          <LinkRow label="Book a call" url={`${WEB_URL}/book/${user.username}`} />
        </div>

        <form
          className="mt-5 flex flex-wrap items-end gap-3 border-t border-line pt-5"
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
          <Button
            type="submit"
            variant="outline"
            className="mb-[22px]"
            disabled={!changed || update.isPending}
          >
            {update.isPending ? 'Saving…' : 'Save'}
          </Button>
        </form>
        {update.isError ? (
          <Notice tone="error" className="mt-3">
            {errorMessage(update.error)}
          </Notice>
        ) : null}
      </CardContent>
    </Card>
  );
}
