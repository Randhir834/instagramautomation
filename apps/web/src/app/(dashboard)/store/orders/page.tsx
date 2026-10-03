'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge, EmptyState, Notice } from '@/components/ui/field';
import { useOrders } from '@/hooks/useStore';
import { errorMessage } from '@/lib/api';
import { formatDateTime, formatMoney } from '@/lib/utils';

export default function OrdersPage() {
  const { data, isLoading, error } = useOrders();
  return (
    <>
      <PageHeader
        title="Orders"
        description="Purchases of your products."
        actions={
          <Button variant="outline" asChild>
            <Link href="/store">Back to store</Link>
          </Button>
        }
      />
      {isLoading ? <p className="text-ink/75">Loading…</p> : null}
      {error ? <Notice tone="error">{errorMessage(error)}</Notice> : null}
      {data && data.length === 0 ? (
        <EmptyState title="No orders yet">
          When someone buys a product it shows up here, and they get their download by email.
        </EmptyState>
      ) : null}
      <ul className="space-y-3">
        {data?.map((order) => (
          <li key={order.id} className="rounded-xl border-2 border-ink bg-white p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="break-words font-semibold">{order.product.title}</p>
                <p className="break-all text-sm text-ink/75">
                  {order.buyerName ? `${order.buyerName} · ` : ''}
                  {order.buyerEmail}
                </p>
                <p className="text-sm text-ink/75">{formatDateTime(order.createdAt)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-display text-xl">{formatMoney(order.amountInPaise)}</span>
                <Badge tone={order.status === 'PAID' ? 'green' : 'red'}>
                  {order.status === 'PAID' ? 'Paid' : 'Failed'}
                </Badge>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
