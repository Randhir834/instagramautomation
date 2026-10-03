'use client';

import { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { EmptyState, Notice } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { type Contact, useContacts, useDeleteContact } from '@/hooks/useContacts';
import { errorMessage } from '@/lib/api';
import { API_URL, formatDateTime, formatNumber } from '@/lib/utils';

function ContactCard({ contact }: { contact: Contact }) {
  const remove = useDeleteContact();
  return (
    <li className="rounded-xl border-2 border-ink bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="break-all font-semibold">
            {contact.username ? `@${contact.username}` : 'Instagram user'}
          </p>
          {contact.email ? (
            <p className="break-all text-sm">
              <span className="text-ink/75">Email: </span>
              <a href={`mailto:${contact.email}`} className="underline">
                {contact.email}
              </a>
            </p>
          ) : null}
          {contact.phone ? (
            <p className="break-all text-sm">
              <span className="text-ink/75">Phone: </span>
              {contact.phone}
            </p>
          ) : null}
          {!contact.email && !contact.phone ? (
            <p className="text-sm text-ink/75">No email or phone shared yet</p>
          ) : null}
          <p className="text-sm text-ink/75">
            Last active {formatDateTime(contact.lastInteractionAt)}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          disabled={remove.isPending}
          onClick={() => {
            if (window.confirm('Delete this contact and their message history?')) {
              remove.mutate(contact.id);
            }
          }}
        >
          Delete
        </Button>
      </div>
      {contact.tags.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {contact.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-moss px-2 py-0.5 text-xs font-bold text-white"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}
    </li>
  );
}

export default function ContactsPage() {
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Wait until typing pauses before searching.
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(input.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [input]);

  const { data, isLoading, error } = useContacts({ page, search });
  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <>
      <PageHeader
        title="Contacts"
        description="Everyone who interacted with your automations."
        actions={
          <Button variant="outline" asChild>
            <a href={`${API_URL}/contacts/export.csv`}>Download CSV</a>
          </Button>
        }
      />

      <div className="mb-4">
        <label htmlFor="search" className="sr-only">
          Search contacts
        </label>
        <Input
          id="search"
          type="search"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search by username, email or phone"
        />
      </div>

      {isLoading ? <p className="text-ink/75">Loading…</p> : null}
      {error ? <Notice tone="error">{errorMessage(error)}</Notice> : null}

      {data && data.total === 0 ? (
        <EmptyState title={search ? 'No contacts match that search' : 'No contacts yet'}>
          {search
            ? 'Try a different name, email or number.'
            : 'People appear here as soon as they comment a keyword or message you.'}
        </EmptyState>
      ) : null}

      <ul className="space-y-3">
        {data?.items.map((contact) => (
          <ContactCard key={contact.id} contact={contact} />
        ))}
      </ul>

      {data && data.total > 0 ? (
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="text-ink/75">
            {formatNumber(data.total)} contact{data.total === 1 ? '' : 's'} · page {page} of {pages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}
    </>
  );
}
