'use client';

import type { InvoiceStatus } from '@repo/shared';
import { Check, Copy, FileDown, FileText, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { EmptyState, ListSkeleton, Notice, Select } from '@/components/ui/field';
import {
  type InvoiceRow,
  useDeleteInvoice,
  useInvoices,
  useSetInvoiceStatus,
} from '@/hooks/useInvoices';
import { errorMessage } from '@/lib/api';
import { API_URL, cn, formatDate, formatMoney, WEB_URL } from '@/lib/utils';

const STATUS: Record<InvoiceStatus, { label: string; style: string }> = {
  DRAFT: { label: 'Draft', style: 'bg-ink/[0.06] text-ink-soft' },
  SENT: { label: 'Sent', style: 'bg-butter-tint text-butter-dark' },
  PAID: { label: 'Paid', style: 'bg-moss-tint text-moss-dark' },
  VOID: { label: 'Void', style: 'bg-brand-tint text-brand-dark' },
};

function InvoiceRowView({ invoice }: { invoice: InvoiceRow }) {
  const setStatus = useSetInvoiceStatus();
  const remove = useDeleteInvoice();
  const [copied, setCopied] = useState(false);
  const error = setStatus.error ?? remove.error;
  const shareUrl = `${WEB_URL}/invoice/${invoice.id}`;

  async function copyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="flex flex-wrap items-baseline gap-x-2">
            <span className="font-semibold text-ink">{invoice.number}</span>
            <span className="text-sm text-ink-soft">{formatDate(invoice.issuedAt)}</span>
          </p>
          <p className="mt-0.5 text-sm text-ink [overflow-wrap:anywhere]">{invoice.clientName}</p>
        </div>
        <p className="text-lg font-semibold tabular-nums text-ink">
          {formatMoney(invoice.total, invoice.currency)}
        </p>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
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
          className={cn(
            'h-9 w-auto border-transparent py-0 pl-3 text-sm font-semibold shadow-none',
            STATUS[invoice.status].style,
          )}
        >
          {(Object.keys(STATUS) as InvoiceStatus[]).map((s) => (
            <option key={s} value={s}>
              {STATUS[s].label}
            </option>
          ))}
        </Select>
        <Button variant="outline" size="sm" asChild>
          <a href={`${API_URL}/invoices/${invoice.id}/pdf`} target="_blank" rel="noreferrer">
            <FileDown /> PDF
          </a>
        </Button>
        {invoice.status === 'DRAFT' ? null : (
          <Button variant="outline" size="sm" onClick={copyLink}>
            {copied ? <Check /> : <Copy />} {copied ? 'Copied' : 'Copy link'}
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Delete ${invoice.number}`}
          disabled={remove.isPending}
          className="ml-auto hover:text-brand-dark"
          onClick={() => {
            if (window.confirm(`Delete ${invoice.number}?`)) remove.mutate(invoice.id);
          }}
        >
          <Trash2 />
        </Button>
      </div>

      {invoice.status === 'DRAFT' ? (
        <p className="mt-3 text-[13px] text-ink-soft">
          Drafts are private. Set it to Sent to get a link you can share with your client.
        </p>
      ) : (
        <p className="mt-3 text-[13px] text-ink-soft [overflow-wrap:anywhere]">
          Share link:{' '}
          <a
            href={shareUrl}
            target="_blank"
            rel="noreferrer"
            className="text-ink underline-offset-4 hover:underline"
          >
            {shareUrl.replace(/^https?:\/\//, '')}
          </a>
        </p>
      )}
      {error ? (
        <Notice tone="error" className="mt-3">
          {errorMessage(error)}
        </Notice>
      ) : null}
    </div>
  );
}

export default function InvoicesPage() {
  const { data, isLoading, error } = useInvoices();
  const newButton = (
    <Button asChild>
      <Link href="/invoices/new">
        <Plus /> New invoice
      </Link>
    </Button>
  );
  return (
    <>
      <PageHeader
        title="Invoices"
        description="Bill brands and clients, and share a clean link or PDF."
        actions={data && data.length > 0 ? newButton : undefined}
      />
      {isLoading ? <ListSkeleton /> : null}
      {error ? <Notice tone="error">{errorMessage(error)}</Notice> : null}
      {data && data.length === 0 ? (
        <EmptyState icon={FileText} title="No invoices yet" action={newButton}>
          Add your client, line items and tax. You get a clean PDF and a link to send.
        </EmptyState>
      ) : null}
      {data && data.length > 0 ? (
        <Card className="divide-y divide-line">
          {data.map((invoice) => (
            <InvoiceRowView key={invoice.id} invoice={invoice} />
          ))}
        </Card>
      ) : null}
    </>
  );
}
