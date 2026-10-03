'use client';

import { Receipt } from 'lucide-react';
import { PageHeader } from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge, EmptyState, ListSkeleton, Notice } from '@/components/ui/field';
import { useOrders } from '@/hooks/useStore';
import { errorMessage } from '@/lib/api';
import { formatDateTime, formatMoney } from '@/lib/utils';

export default function OrdersPage() {
  const { data, isLoading, error } = useOrders();
  const paid = data?.filter((o) => o.status === 'PAID') ?? [];
  const total = paid.reduce((sum, o) => sum + o.amountInPaise, 0);

  return (
    <>
      <PageHeader
        title="Orders"
        description={
          data && paid.length > 0
            ? `${paid.length} paid order${paid.length === 1 ? '' : 's'} · ${formatMoney(total)} in total`
            : 'Purchases of your products.'
        }
        back={{ href: '/store', label: 'Store' }}
      />
      {isLoading ? <ListSkeleton /> : null}
      {error ? <Notice tone="error">{errorMessage(error)}</Notice> : null}
      {data && data.length === 0 ? (
        <EmptyState icon={Receipt} title="No orders yet">
          When someone buys a product it shows up here, and they get their download by email.
        </EmptyState>
      ) : null}
      {data && data.length > 0 ? (
        <Card className="divide-y divide-line">
          {data.map((order) => (
            <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div className="min-w-0">
                <p className="font-semibold text-ink [overflow-wrap:anywhere]">
                  {order.product.title}
                </p>
                <p className="mt-0.5 text-sm text-ink-soft [overflow-wrap:anywhere]">
                  {order.buyerName ? `${order.buyerName} · ` : ''}
                  {order.buyerEmail}
                </p>
                <p className="text-[13px] text-ink-soft">{formatDateTime(order.createdAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-base font-semibold tabular-nums text-ink">
                  {formatMoney(order.amountInPaise)}
                </span>
                <Badge dot tone={order.status === 'PAID' ? 'green' : 'red'}>
                  {order.status === 'PAID' ? 'Paid' : 'Failed'}
                </Badge>
              </div>
            </div>
          ))}
        </Card>
      ) : null}
    </>
  );
}
