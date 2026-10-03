'use client';

import type { InvoiceStatus } from '@repo/shared';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { EmptyState, Notice, Select } from '@/components/ui/field';
import {
  type InvoiceRow,
  useDeleteInvoice,
  useInvoices,
  useSetInvoiceStatus,
} from '@/hooks/useInvoices';
import { errorMessage } from '@/lib/api';
import { API_URL, formatDate, formatMoney, WEB_URL } from '@/lib/utils';

const STATUS_LABEL: Record<InvoiceStatus, string> = {
  DRAFT: 'Draft (only you can see it)',
  SENT: 'Sent',
  PAID: 'Paid',
  VOID: 'Void',
};

function InvoiceCard({ invoice }: { invoice: InvoiceRow }) {
  const setStatus = useSetInvoiceStatus();
  const remove = useDeleteInvoice();
  const error = setStatus.error ?? remove.error;
  const shareUrl = `${WEB_URL}/invoice/${invoice.id}`;

  return (
    <li className="rounded-xl border-2 border-ink bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-xl">{invoice.number}</p>
          <p className="break-words text-sm">
            {invoice.clientName} · {formatDate(invoice.issuedAt)}
          </p>
        </div>
        <p className="font-display text-2xl">{formatMoney(invoice.total, invoice.currency)}</p>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label htmlFor={`status-${invoice.id}`} className="sr-only">
          Status of {invoice.number}
        </label>
        <Select
          id={`status-${invoice.id}`}
          value={invoice.status}
          disabled={setStatus.isPending}
          onChange={(e) =>
            setStatus.mutate({ id: invoice.id, status: e.target.value as InvoiceStatus })
          }
          className="w-auto py-1.5 text-sm"
        >
          {(Object.keys(STATUS_LABEL) as InvoiceStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </Select>
        <Button variant="outline" size="sm" asChild>
          <a href={`${API_URL}/invoices/${invoice.id}/pdf`} target="_blank" rel="noreferrer">
            PDF
          </a>
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={remove.isPending}
          onClick={() => {
            if (window.confirm(`Delete ${invoice.number}?`)) remove.mutate(invoice.id);
          }}
        >
          Delete
        </Button>
      </div>

      {invoice.status === 'DRAFT' ? (
        <p className="mt-3 text-sm text-ink/75">
          Mark it as Sent to get a link you can share with your client.
        </p>
      ) : (
        <p className="mt-3 text-sm">
          <span className="text-ink/75">Share link: </span>
          <a href={shareUrl} target="_blank" rel="noreferrer" className="break-all underline">
            {shareUrl}
          </a>
        </p>
      )}
      {error ? (
        <Notice tone="error" className="mt-3">
          {errorMessage(error)}
        </Notice>
      ) : null}
    </li>
  );
}

export default function InvoicesPage() {
  const { data, isLoading, error } = useInvoices();
  return (
    <>
      <PageHeader
        title="Invoices"
        description="Bill brands and clients."
        actions={
          <Button asChild>
            <Link href="/invoices/new">New invoice</Link>
          </Button>
        }
      />
      {isLoading ? <p className="text-ink/75">Loading…</p> : null}
      {error ? <Notice tone="error">{errorMessage(error)}</Notice> : null}
      {data && data.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          action={
            <Button asChild>
              <Link href="/invoices/new">Create an invoice</Link>
            </Button>
          }
        >
          Add your client, line items and tax. You get a clean PDF and a link to send.
        </EmptyState>
      ) : null}
      <ul className="space-y-3">
        {data?.map((invoice) => (
          <InvoiceCard key={invoice.id} invoice={invoice} />
        ))}
      </ul>
    </>
  );
}
