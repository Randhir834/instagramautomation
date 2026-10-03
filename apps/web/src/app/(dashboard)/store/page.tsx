'use client';

import Link from 'next/link';
import { PageHeader } from '@/components/layout/PageHeader';
import { Button } from '@/components/ui/button';
import { Badge, EmptyState, Notice } from '@/components/ui/field';
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
    <li className="rounded-xl border-2 border-ink bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2">
            <span className="break-words font-display text-xl">{product.title}</span>
            <Badge tone={product.isPublished ? 'green' : 'neutral'}>
              {product.isPublished ? 'On your store' : 'Hidden'}
            </Badge>
          </p>
          <p className="mt-1 text-sm">
            <span className="font-semibold">{formatMoney(product.priceInPaise)}</span>
            <span className="text-ink/75">
              {' '}
              · {sold} order{sold === 1 ? '' : 's'}
            </span>
          </p>
          {product.isPublished ? (
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="mt-1 block break-all text-sm underline"
            >
              {url}
            </a>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={publish.isPending}
            onClick={() => publish.mutate({ id: product.id, isPublished: !product.isPublished })}
          >
            {product.isPublished ? 'Hide' : 'Show on store'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={remove.isPending}
            onClick={() => {
              if (window.confirm(`Delete "${product.title}"?`)) remove.mutate(product.id);
            }}
          >
            Delete
          </Button>
        </div>
      </div>
      {error ? (
        <Notice tone="error" className="mt-3">
          {errorMessage(error)}
        </Notice>
      ) : null}
    </li>
  );
}

export default function StorePage() {
  const { data: user } = useCurrentUser();
  const { data, isLoading, error } = useProducts();
  return (
    <>
      <PageHeader
        title="Store"
        description="Digital products you sell from your link in bio."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link href="/store/orders">Orders</Link>
            </Button>
            <Button asChild>
              <Link href="/store/products/new">New product</Link>
            </Button>
          </>
        }
      />
      {isLoading ? <p className="text-ink/75">Loading…</p> : null}
      {error ? <Notice tone="error">{errorMessage(error)}</Notice> : null}
      {data && data.length === 0 ? (
        <EmptyState
          title="Nothing for sale yet"
          action={
            <Button asChild>
              <Link href="/store/products/new">Add your first product</Link>
            </Button>
          }
        >
          Upload a PDF, preset pack, course or template. Buyers pay and get the download by email.
        </EmptyState>
      ) : null}
      <ul className="space-y-3">
        {data?.map((product) => (
          <ProductRow key={product.id} product={product} username={user?.username ?? ''} />
        ))}
      </ul>
    </>
  );
}
