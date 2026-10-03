'use client';

import { Download, Search, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Avatar } from '@/components/layout/Brand';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState, ListSkeleton, Notice } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { type Contact, useContacts, useDeleteContact } from '@/hooks/useContacts';
import { errorMessage } from '@/lib/api';
import { API_URL, formatNumber, formatRelative, initials } from '@/lib/utils';

function displayName(contact: Contact): string {
  return contact.username ? `@${contact.username}` : 'Instagram user';
}

function Tags({ tags }: { tags: string[] }) {
  if (tags.length === 0) return <span className="text-ink-soft">—</span>;
  return (
    <span className="flex flex-wrap gap-1">
      {tags.map((tag) => (
        <span
          key={tag}
          className="rounded-full bg-moss-tint px-2 py-0.5 text-xs font-semibold text-moss-dark"
        >
          {tag}
        </span>
      ))}
    </span>
  );
}

function DeleteButton({ contact }: { contact: Contact }) {
  const remove = useDeleteContact();
  return (
    <Button
      variant="ghost"
      size="icon"
      aria-label={`Delete ${displayName(contact)}`}
      disabled={remove.isPending}
      className="hover:text-brand-dark"
      onClick={() => {
        if (window.confirm(`Delete ${displayName(contact)} and their message history?`)) {
          remove.mutate(contact.id);
        }
      }}
    >
      <Trash2 />
    </Button>
  );
}

function ContactAvatar({ contact }: { contact: Contact }) {
  return (
    <Avatar
      text={initials((contact.username ?? 'IG').replace(/[._]/g, ' '))}
      className="h-8 w-8 bg-sky-tint text-[11px] text-sky-dark"
    />
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
  const hasAny = Boolean(data && (data.total > 0 || search));

  return (
    <>
      <PageHeader
        title="Contacts"
        description="Everyone who interacted with your automations."
        actions={
          hasAny ? (
            <Button variant="outline" asChild>
              <a href={`${API_URL}/contacts/export.csv`}>
                <Download /> Export CSV
              </a>
            </Button>
          ) : undefined
        }
      />

      {hasAny ? (
        <div className="relative mb-4">
          <label htmlFor="search" className="sr-only">
            Search contacts
          </label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft" />
          <Input
            id="search"
            type="search"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Search by username, email or phone"
            className="pl-10"
          />
        </div>
      ) : null}

      {isLoading ? <ListSkeleton /> : null}
      {error ? <Notice tone="error">{errorMessage(error)}</Notice> : null}

      {data && data.total === 0 ? (
        search ? (
          <EmptyState icon={Search} title="No contacts match that search">
            Try a different name, email or number.
          </EmptyState>
        ) : (
          <EmptyState icon={Users} title="No contacts yet">
            People appear here as soon as they comment a keyword or message you.
          </EmptyState>
        )
      ) : null}

      {data && data.total > 0 ? (
        <Card className="overflow-hidden">
          {/* Phones and tablets: stacked cards */}
          <ul className="divide-y divide-line lg:hidden">
            {data.items.map((contact) => (
              <li key={contact.id} className="flex items-start gap-3 p-4">
                <ContactAvatar contact={contact} />
                <div className="min-w-0 flex-1 space-y-1 text-sm">
                  <p className="font-semibold text-ink [overflow-wrap:anywhere]">
                    {displayName(contact)}
                  </p>
                  {contact.email ? (
                    <a
                      href={`mailto:${contact.email}`}
                      className="block text-ink underline-offset-4 [overflow-wrap:anywhere] hover:underline"
                    >
                      {contact.email}
                    </a>
                  ) : null}
                  {contact.phone ? <p className="text-ink">{contact.phone}</p> : null}
                  {!contact.email && !contact.phone ? (
                    <p className="text-ink-soft">No email or phone yet</p>
                  ) : null}
                  <Tags tags={contact.tags} />
                  <p className="text-[13px] text-ink-soft">
                    Active {formatRelative(contact.lastInteractionAt)}
                  </p>
                </div>
                <DeleteButton contact={contact} />
              </li>
            ))}
          </ul>

          {/* Laptops and up: a table */}
          <table className="hidden w-full text-left text-sm lg:table">
            <thead className="border-b border-line bg-paper/60 text-[13px] text-ink-soft">
              <tr>
                <th scope="col" className="px-5 py-3 font-medium">
                  Contact
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  Email
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  Phone
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  Tags
                </th>
                <th scope="col" className="px-5 py-3 font-medium">
                  Last active
                </th>
                <th scope="col" className="px-3 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.items.map((contact) => (
                <tr key={contact.id} className="transition-colors hover:bg-paper/50">
                  <td className="px-5 py-3">
                    <span className="flex items-center gap-2.5">
                      <ContactAvatar contact={contact} />
                      <span className="font-semibold text-ink [overflow-wrap:anywhere]">
                        {displayName(contact)}
                      </span>
                    </span>
                  </td>
                  <td className="px-5 py-3 [overflow-wrap:anywhere]">
                    {contact.email ? (
                      <a
                        href={`mailto:${contact.email}`}
                        className="text-ink underline-offset-4 hover:underline"
                      >
                        {contact.email}
                      </a>
                    ) : (
                      <span className="text-ink-soft">—</span>
                    )}
                  </td>
                  <td className="whitespace-nowrap px-5 py-3">
                    {contact.phone ?? <span className="text-ink-soft">—</span>}
                  </td>
                  <td className="px-5 py-3">
                    <Tags tags={contact.tags} />
                  </td>
                  <td className="whitespace-nowrap px-5 py-3 text-ink-soft">
                    {formatRelative(contact.lastInteractionAt)}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <DeleteButton contact={contact} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-paper/60 px-5 py-3 text-sm">
            <span className="text-ink-soft">
              {formatNumber(data.total)} contact{data.total === 1 ? '' : 's'} · page {page} of{' '}
              {pages}
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
        </Card>
      ) : null}
    </>
  );
}
