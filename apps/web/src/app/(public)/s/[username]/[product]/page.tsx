import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BuyBox } from '@/components/store/BuyBox';
import type { PublicProduct } from '@/components/store/ProductCard';
import { fetchPublic } from '@/lib/api';

type Product = PublicProduct & { user: { name: string; username: string } };
type Props = { params: Promise<{ username: string; product: string }> };

const load = (username: string, slug: string) =>
  fetchPublic<Product>(`/public/store/${encodeURIComponent(username)}/${encodeURIComponent(slug)}`);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, product: slug } = await params;
  const product = await load(username, slug).catch(() => null);
  return { title: product ? `${product.title} by ${product.user.name}` : 'Product' };
}

/** Product page with checkout. */
export default async function ProductPage({ params }: Props) {
  const { username, product: slug } = await params;
  const product = await load(username, slug);
  if (!product) notFound();

  return (
    <>
      <Link
        href={`/s/${product.user.username}`}
        className="text-sm font-semibold underline underline-offset-4"
      >
        ← More from {product.user.name}
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-[1.2fr_1fr] md:items-start">
        <div className="min-w-0">
          {product.coverImageUrl ? (
            <img
              src={product.coverImageUrl}
              alt=""
              className="mb-5 aspect-[4/3] w-full rounded-2xl border-2 border-ink object-cover"
            />
          ) : null}
          <h1 className="break-words font-display text-4xl leading-tight">{product.title}</h1>
          <p className="mt-1 text-ink/75">by {product.user.name}</p>
          {product.description ? (
            <p className="mt-5 whitespace-pre-line break-words leading-relaxed">
              {product.description}
            </p>
          ) : null}
        </div>
        <BuyBox productId={product.id} priceInPaise={product.priceInPaise} />
      </div>
    </>
  );
}
