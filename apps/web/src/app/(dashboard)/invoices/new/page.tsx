'use client';

import { calculateInvoiceTotals, createInvoiceSchema } from '@repo/shared';
import { Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
      <PageHeader
        title="New invoice"
        description="It gets the next invoice number automatically."
        back={{ href: '/invoices', label: 'Invoices' }}
      />
      <form
        onSubmit={handleSubmit}
        noValidate
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]"
      >
        <div className="min-w-0 space-y-5">
          <Card>
            <CardHeader title="Bill to" />
            <CardContent className="grid gap-5 sm:grid-cols-2">
              <Field label="Client or brand" htmlFor="clientName">
                <Input
                  id="clientName"
                  value={clientName}
                  maxLength={120}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Bake Co"
                />
              </Field>
              <Field label="Client email" htmlFor="clientEmail" aside="Optional">
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="accounts@bake.co"
                />
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Line items" />
            <CardContent className="space-y-3">
              {items.map((item, i) => (
                <div
                  key={i}
                  className="grid gap-3 rounded-[10px] border border-line bg-paper/40 p-3 sm:grid-cols-[minmax(0,1fr)_5.5rem_8.5rem_auto] sm:items-end"
                >
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
                  <Field label="Price each" htmlFor={`price-${i}`}>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[15px] text-ink-soft">
                        ₹
                      </span>
                      <Input
                        id={`price-${i}`}
                        type="number"
                        min={0}
                        step="any"
                        inputMode="decimal"
                        value={item.rupees}
                        className="pl-7"
                        onChange={(e) => setItem(i, { rupees: e.target.value })}
                      />
                    </div>
                  </Field>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mb-1 hover:text-brand-dark disabled:bg-transparent disabled:opacity-40"
                    aria-label={`Remove item ${i + 1}`}
                    disabled={items.length === 1}
                    onClick={() => setItems(items.filter((_, j) => j !== i))}
                  >
                    <Trash2 />
                  </Button>
                </div>
              ))}
              {items.length < 50 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="-ml-2"
                  onClick={() => setItems([...items, blankItem()])}
                >
                  <Plus /> Add item
                </Button>
              ) : null}
            </CardContent>
          </Card>

          {problem ? <Notice tone="error">{problem}</Notice> : null}
          {create.isError ? <Notice tone="error">{errorMessage(create.error)}</Notice> : null}
        </div>

        <div className="lg:sticky lg:top-8 lg:self-start">
          <Card>
            <CardHeader title="Summary" />
            <CardContent>
              <Field label="Tax" htmlFor="tax" hint="18 for GST. Use 0 for none.">
                <div className="relative">
                  <Input
                    id="tax"
                    type="number"
                    min={0}
                    max={100}
                    step="any"
                    inputMode="decimal"
                    value={taxPercent}
                    onChange={(e) => setTaxPercent(e.target.value)}
                    className="pr-8"
                  />
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[15px] text-ink-soft">
                    %
                  </span>
                </div>
              </Field>
              <dl className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-soft">Subtotal</dt>
                  <dd className="tabular-nums">{formatMoney(totals.subtotal)}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-ink-soft">Tax</dt>
                  <dd className="tabular-nums">{formatMoney(totals.tax)}</dd>
                </div>
                <div className="flex justify-between gap-4 border-t border-line pt-3 text-base font-semibold">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatMoney(totals.total)}</dd>
                </div>
              </dl>
              <Button type="submit" size="lg" className="mt-5 w-full" disabled={create.isPending}>
                {create.isPending ? 'Saving…' : 'Save invoice'}
              </Button>
              <Button type="button" variant="ghost" className="mt-2 w-full" asChild>
                <Link href="/invoices">Cancel</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </>
  );
}
