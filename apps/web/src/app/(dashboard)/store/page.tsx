'use client';

import { ExternalLink, Package, Plus, Receipt, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge, EmptyState, ListSkeleton, Notice, Toggle } from '@/components/ui/field';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { type Product, useDeleteProduct, useProducts, useSetPublished } from '@/hooks/useStore';
import { errorMessage } from '@/lib/api';
import { formatMoney, WEB_URL } from '@/lib/utils';

function ProductRow({ product, username }: { product: Product; username: string }) {
  const publish = useSetPublished();
  const remove = useDeleteProduct();
  const error = publish.error ?? remove.error;
  const url = `${WEB_URL}/s/${username}/${product.slug}`;
  const sold = product._count?.orders ?? 0;

  return (
    <div className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          {product.coverImageUrl ? (
            <img
              src={product.coverImageUrl}
              alt=""
              className="h-16 w-16 shrink-0 rounded-lg border border-line object-cover"
            />
          ) : (
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-moss-tint text-moss-dark">
              <Package className="h-6 w-6" />
            </span>
          )}
          <div className="min-w-0">
            <p className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-ink [overflow-wrap:anywhere]">
                {product.title}
              </span>
              <Badge dot tone={product.isPublished ? 'green' : 'neutral'}>
                {product.isPublished ? 'Live' : 'Hidden'}
              </Badge>
            </p>
            <p className="mt-0.5 text-sm text-ink-soft">
              <span className="font-semibold text-ink">{formatMoney(product.priceInPaise)}</span> ·{' '}
              {sold} sold
            </p>
            {product.isPublished ? (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-[13px] text-ink-soft underline-offset-4 [overflow-wrap:anywhere] hover:text-ink hover:underline"
              >
                {url.replace(/^https?:\/\//, '')}
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-medium text-ink-soft">
            <Toggle
              checked={product.isPublished}
              disabled={publish.isPending}
              label={`${product.isPublished ? 'Hide' : 'Show'} ${product.title} on your store`}
              onChange={(isPublished) => publish.mutate({ id: product.id, isPublished })}
            />
            On store
          </label>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${product.title}`}
            disabled={remove.isPending}
            className="hover:text-brand-dark"
            onClick={() => {
              if (window.confirm(`Delete "${product.title}"?`)) remove.mutate(product.id);
            }}
          >
            <Trash2 />
          </Button>
        </div>
      </div>
      {error ? (
        <Notice tone="error" className="mt-3">
          {errorMessage(error)}
        </Notice>
      ) : null}
    </div>
  );
}

export default function StorePage() {
  const { data: user } = useCurrentUser();
  const { data, isLoading, error } = useProducts();
  const newButton = (
    <Button asChild>
      <Link href="/store/products/new">
        <Plus /> New product
      </Link>
    </Button>
  );
  return (
    <>
      <PageHeader
        title="Store"
        description="Digital products you sell from your link in bio."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/store/orders">
                <Receipt /> Orders
              </Link>
            </Button>
            {data && data.length > 0 ? newButton : null}
          </>
        }
      />
      {isLoading ? <ListSkeleton /> : null}
      {error ? <Notice tone="error">{errorMessage(error)}</Notice> : null}
      {data && data.length === 0 ? (
        <EmptyState icon={Package} title="Nothing for sale yet" action={newButton}>
          Upload a PDF, preset pack, course or template. Buyers pay and get the download by email.
        </EmptyState>
      ) : null}
      {data && data.length > 0 ? (
        <Card className="divide-y divide-line">
          {data.map((product) => (
            <ProductRow key={product.id} product={product} username={user?.username ?? ''} />
          ))}
        </Card>
      ) : null}
    </>
  );
}
