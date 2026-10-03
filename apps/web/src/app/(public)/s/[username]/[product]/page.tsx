import { ArrowLeft, Download, Mail } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BuyBox } from '@/components/store/BuyBox';
import { ProductCover, type PublicProduct } from '@/components/store/ProductCard';
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
        className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> More from {product.user.name}
      </Link>

      <div className="mt-6 grid gap-8 md:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] md:items-start">
        <div className="min-w-0">
          <ProductCover
            product={product}
            className="aspect-[4/3] rounded-xl border border-line shadow-soft"
          />
          <h1 className="mt-6 font-display text-[34px] font-medium leading-tight tracking-tight [overflow-wrap:anywhere]">
            {product.title}
          </h1>
          <p className="mt-1 text-[15px] text-ink-soft">by {product.user.name}</p>
          {product.description ? (
            <p className="mt-5 whitespace-pre-line text-[15px] leading-relaxed text-ink [overflow-wrap:anywhere]">
              {product.description}
            </p>
          ) : null}
          <ul className="mt-6 space-y-2.5 border-t border-line pt-6 text-sm text-ink-soft">
            <li className="flex items-center gap-2.5">
              <Download className="h-4 w-4 text-ink" /> Instant download after payment
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 text-ink" /> A copy of the link is emailed to you
            </li>
          </ul>
        </div>
        <BuyBox productId={product.id} priceInPaise={product.priceInPaise} />
      </div>
    </>
  );
}
