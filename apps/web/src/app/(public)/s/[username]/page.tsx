import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductCard, type PublicProduct } from '@/components/store/ProductCard';
import { fetchPublic } from '@/lib/api';

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
      <header className="mb-8 text-center">
        <h1 className="break-words font-display text-4xl">{store.name}</h1>
        <p className="mt-1 text-ink/75">@{store.username}</p>
      </header>

      {store.products.length === 0 ? (
        <p className="rounded-xl border-2 border-dashed border-ink/30 bg-white p-8 text-center text-ink/75">
          Nothing for sale here yet. Check back soon.
        </p>
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
