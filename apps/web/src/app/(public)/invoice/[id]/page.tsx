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

/** Public invoice view. */
export default async function PublicInvoicePage({ params }: Props) {
  const invoice = await load((await params).id);
  if (!invoice) notFound();
  const money = (amount: number) => formatMoney(amount, invoice.currency);
  const status = STATUS[invoice.status];

  return (
    <article className="slab rounded-2xl bg-white p-5 sm:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl">Invoice</h1>
          <p className="text-ink/75">{invoice.number}</p>
        </div>
        <div className="text-left sm:text-right">
          <p className="break-words font-semibold">{invoice.sellerName}</p>
          <p className="text-sm text-ink/75">Issued {formatDate(invoice.issuedAt)}</p>
          <Badge tone={status.tone} className="mt-1">
            {status.label}
          </Badge>
        </div>
      </header>

      <section className="mt-6">
        <p className="text-sm text-ink/75">Billed to</p>
        <p className="break-words font-semibold">{invoice.clientName}</p>
      </section>

      <ul className="mt-6 divide-y-2 divide-ink/10 border-y-2 border-ink">
        {invoice.items.map((item, i) => (
          <li key={i} className="flex flex-wrap justify-between gap-x-6 gap-y-1 py-3">
            <div className="min-w-0">
              <p className="break-words font-medium">{item.description}</p>
              <p className="text-sm text-ink/75">
                {item.quantity} × {money(item.unitPrice)}
              </p>
            </div>
            <p className="font-semibold">{money(Math.round(item.quantity * item.unitPrice))}</p>
          </li>
        ))}
      </ul>

      <dl className="ml-auto mt-5 max-w-xs space-y-1.5">
        <div className="flex justify-between gap-4">
          <dt>Subtotal</dt>
          <dd>{money(invoice.subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt>Tax ({invoice.taxPercent}%)</dt>
          <dd>{money(invoice.tax)}</dd>
        </div>
        <div className="flex justify-between gap-4 border-t-2 border-ink pt-2 text-xl font-bold">
          <dt>Total</dt>
          <dd>{money(invoice.total)}</dd>
        </div>
      </dl>

      <div className="mt-8">
        <Button variant="outline" asChild>
          <a href={`${API_URL}/public/invoice/${invoice.id}/pdf`} target="_blank" rel="noreferrer">
            Download PDF
          </a>
        </Button>
      </div>
    </article>
  );
}
