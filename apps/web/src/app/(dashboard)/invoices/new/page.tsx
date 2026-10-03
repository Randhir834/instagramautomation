'use client';

import { calculateInvoiceTotals, createInvoiceSchema } from '@repo/shared';
import { Plus, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Field, Notice } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useCreateInvoice } from '@/hooks/useInvoices';
import { errorMessage } from '@/lib/api';
import { formatMoney } from '@/lib/utils';

interface ItemDraft {
  description: string;
  quantity: string;
  rupees: string;
}
const blankItem = (): ItemDraft => ({ description: '', quantity: '1', rupees: '' });

export default function NewInvoicePage() {
  const router = useRouter();
  const create = useCreateInvoice();
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [taxPercent, setTaxPercent] = useState('18');
  const [items, setItems] = useState<ItemDraft[]>([blankItem()]);
  const [problem, setProblem] = useState<string | null>(null);

  const parsedItems = items.map((item) => ({
    description: item.description.trim(),
    quantity: Number(item.quantity) || 0,
    unitPrice: Math.round((Number(item.rupees) || 0) * 100),
  }));
  const tax = Number(taxPercent) || 0;
  const totals = calculateInvoiceTotals(parsedItems, tax);

  const setItem = (index: number, patch: Partial<ItemDraft>) =>
    setItems(items.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const result = createInvoiceSchema.safeParse({
      clientName,
      clientEmail,
      items: parsedItems,
      taxPercent: tax,
    });
    if (!result.success) {
      const issue = result.error.issues[0];
      const where =
        issue?.path[0] === 'items' && typeof issue.path[1] === 'number'
          ? `Item ${issue.path[1] + 1}: `
          : '';
      setProblem(`${where}${issue?.message ?? 'Please check the form.'}`);
      return;
    }
    setProblem(null);
    create.mutate(result.data, { onSuccess: () => router.push('/invoices') });
  }

  return (
    <>
      <PageHeader title="New invoice" description="Add your client, line items and tax." />
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <section className="grid gap-4 rounded-xl border-2 border-ink bg-white p-5 sm:grid-cols-2">
          <Field label="Client or brand name" htmlFor="clientName">
            <Input
              id="clientName"
              value={clientName}
              maxLength={120}
              onChange={(e) => setClientName(e.target.value)}
            />
          </Field>
          <Field label="Client email (optional)" htmlFor="clientEmail">
            <Input
              id="clientEmail"
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
            />
          </Field>
        </section>

        <section className="rounded-xl border-2 border-ink bg-white p-5">
          <h2 className="font-display text-xl">Items</h2>
          <div className="mt-4 space-y-4">
            {items.map((item, i) => (
              <div key={i} className="rounded-lg border-2 border-ink/15 p-3">
                <div className="grid gap-3 sm:grid-cols-[1fr_6rem_9rem_auto] sm:items-end">
                  <Field label="Description" htmlFor={`desc-${i}`}>
                    <Input
                      id={`desc-${i}`}
                      value={item.description}
                      maxLength={200}
                      placeholder="1 reel + 2 stories"
                      onChange={(e) => setItem(i, { description: e.target.value })}
                    />
                  </Field>
                  <Field label="Qty" htmlFor={`qty-${i}`}>
                    <Input
                      id={`qty-${i}`}
                      type="number"
                      min={0}
                      step="any"
                      inputMode="decimal"
                      value={item.quantity}
                      onChange={(e) => setItem(i, { quantity: e.target.value })}
                    />
                  </Field>
                  <Field label="Price each (₹)" htmlFor={`price-${i}`}>
                    <Input
                      id={`price-${i}`}
                      type="number"
                      min={0}
                      step="any"
                      inputMode="decimal"
                      value={item.rupees}
                      onChange={(e) => setItem(i, { rupees: e.target.value })}
                    />
                  </Field>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove item ${i + 1}`}
                    disabled={items.length === 1}
                    onClick={() => setItems(items.filter((_, j) => j !== i))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          {items.length < 50 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setItems([...items, blankItem()])}
            >
              <Plus className="h-4 w-4" /> Add item
            </Button>
          ) : null}
        </section>

        <section className="rounded-xl border-2 border-ink bg-white p-5">
          <Field
            label="Tax %"
            htmlFor="tax"
            hint="For example 18 for GST. Use 0 for none."
            className="max-w-[12rem]"
          >
            <Input
              id="tax"
              type="number"
              min={0}
              max={100}
              step="any"
              inputMode="decimal"
              value={taxPercent}
              onChange={(e) => setTaxPercent(e.target.value)}
            />
          </Field>
          <dl className="mt-5 max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between gap-4">
              <dt>Subtotal</dt>
              <dd>{formatMoney(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>Tax</dt>
              <dd>{formatMoney(totals.tax)}</dd>
            </div>
            <div className="flex justify-between gap-4 border-t-2 border-ink pt-2 text-lg font-bold">
              <dt>Total</dt>
              <dd>{formatMoney(totals.total)}</dd>
            </div>
          </dl>
        </section>

        {problem ? <Notice tone="error">{problem}</Notice> : null}
        {create.isError ? <Notice tone="error">{errorMessage(create.error)}</Notice> : null}

        <div className="flex flex-wrap gap-3">
          <Button type="submit" size="lg" disabled={create.isPending}>
            {create.isPending ? 'Saving…' : 'Save invoice'}
          </Button>
          <Button type="button" variant="outline" size="lg" asChild>
            <Link href="/invoices">Cancel</Link>
          </Button>
        </div>
      </form>
    </>
  );
}
