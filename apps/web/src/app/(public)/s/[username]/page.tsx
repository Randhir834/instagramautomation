import { Package } from 'lucide-react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Avatar } from '@/components/layout/Brand';
import { ProductCard, type PublicProduct } from '@/components/store/ProductCard';
import { EmptyState } from '@/components/ui/field';
import { fetchPublic } from '@/lib/api';
import { initials } from '@/lib/utils';

interface Storefront {
  name: string;
  username: string;
  products: PublicProduct[];
}

type Props = { params: Promise<{ username: string }> };

const load = (username: string) =>
  fetchPublic<Storefront>(`/public/store/${encodeURIComponent(username)}`);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const store = await load((await params).username).catch(() => null);
  return { title: store ? `${store.name}'s store` : 'Store' };
}

/** Public store (link in bio). */
export default async function StorefrontPage({ params }: Props) {
  const store = await load((await params).username);
  if (!store) notFound();

  return (
    <>
      <header className="mb-10 flex flex-col items-center text-center">
        <Avatar
          text={initials(store.name)}
          className="h-20 w-20 text-xl shadow-soft ring-4 ring-white"
        />
        <h1 className="mt-4 font-display text-[34px] font-medium leading-tight tracking-tight [overflow-wrap:anywhere]">
          {store.name}
        </h1>
        <p className="mt-1 text-[15px] text-ink-soft">@{store.username}</p>
      </header>

      {store.products.length === 0 ? (
        <EmptyState icon={Package} title="Nothing for sale yet">
          Check back soon.
        </EmptyState>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {store.products.map((product) => (
            <ProductCard key={product.id} product={product} username={store.username} />
          ))}
        </div>
      )}
    </>
  );
}
