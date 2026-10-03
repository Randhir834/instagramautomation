import { FileDown } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/field';
import type { InvoiceView } from '@/hooks/useInvoices';
import { fetchPublic } from '@/lib/api';
import { API_URL, formatDate, formatMoney } from '@/lib/utils';

type Props = { params: Promise<{ id: string }> };

const load = (id: string) => fetchPublic<InvoiceView>(`/public/invoice/${encodeURIComponent(id)}`);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const invoice = await load((await params).id).catch(() => null);
  return {
    title: invoice ? `Invoice ${invoice.number} from ${invoice.sellerName}` : 'Invoice',
    robots: { index: false },
  };
}

const STATUS = {
  DRAFT: { label: 'Draft', tone: 'neutral' },
  SENT: { label: 'Awaiting payment', tone: 'yellow' },
  PAID: { label: 'Paid', tone: 'green' },
  VOID: { label: 'Void', tone: 'red' },
} as const;

/** Public invoice view, laid out like a printed document. */
export default async function PublicInvoicePage({ params }: Props) {
  const invoice = await load((await params).id);
  if (!invoice) notFound();
  const money = (amount: number) => formatMoney(amount, invoice.currency);
  const status = STATUS[invoice.status];

  return (
    <>
      <article className="overflow-hidden rounded-xl border border-line bg-white shadow-lift">
        <div className="h-1.5 bg-brand" aria-hidden />
        <div className="p-6 sm:p-10">
          <header className="flex flex-wrap items-start justify-between gap-6">
            <div>
              <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-ink-soft">
                Invoice
              </p>
              <h1 className="mt-1 font-display text-[32px] font-medium leading-none tracking-tight">
                {invoice.number}
              </h1>
              <Badge dot tone={status.tone} className="mt-3">
                {status.label}
              </Badge>
            </div>
            <div className="text-left sm:text-right">
              <p className="font-semibold text-ink [overflow-wrap:anywhere]">
                {invoice.sellerName}
              </p>
              <p className="text-sm text-ink-soft">Issued {formatDate(invoice.issuedAt)}</p>
            </div>
          </header>

          <section className="mt-8 rounded-lg bg-paper px-4 py-3">
            <p className="text-[13px] text-ink-soft">Billed to</p>
            <p className="font-semibold text-ink [overflow-wrap:anywhere]">{invoice.clientName}</p>
          </section>

          <div className="mt-8">
            <div className="hidden grid-cols-[1fr_auto_auto] gap-6 border-b border-ink pb-2 text-[13px] font-semibold text-ink-soft sm:grid">
              <span>Description</span>
              <span className="w-24 text-right">Qty × price</span>
              <span className="w-28 text-right">Amount</span>
            </div>
            <ul className="divide-y divide-line">
              {invoice.items.map((item, i) => (
                <li key={i} className="grid gap-x-6 gap-y-1 py-3.5 sm:grid-cols-[1fr_auto_auto]">
                  <span className="font-medium text-ink [overflow-wrap:anywhere]">
                    {item.description}
                  </span>
                  <span className="text-sm text-ink-soft sm:w-24 sm:text-right">
                    {item.quantity} × {money(item.unitPrice)}
                  </span>
                  <span className="font-semibold tabular-nums text-ink sm:w-28 sm:text-right">
                    {money(Math.round(item.quantity * item.unitPrice))}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <dl className="ml-auto mt-6 max-w-xs space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">Subtotal</dt>
              <dd className="tabular-nums">{money(invoice.subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-ink-soft">Tax ({invoice.taxPercent}%)</dt>
              <dd className="tabular-nums">{money(invoice.tax)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t border-ink pt-3 text-lg font-semibold">
              <dt>Total</dt>
              <dd className="tabular-nums">{money(invoice.total)}</dd>
            </div>
          </dl>
        </div>
      </article>

      <div className="mt-6 flex justify-center">
        <Button variant="outline" asChild>
          <a href={`${API_URL}/public/invoice/${invoice.id}/pdf`} target="_blank" rel="noreferrer">
            <FileDown /> Download PDF
          </a>
        </Button>
      </div>
    </>
  );
}
