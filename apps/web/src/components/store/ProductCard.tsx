import { ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import { formatMoney } from '@/lib/utils';

export interface PublicProduct {
  id: string;
  title: string;
  description: string;
  priceInPaise: number;
  coverImageUrl: string | null;
  slug: string;
}

const COVER_TINTS = ['bg-moss', 'bg-sky', 'bg-brand', 'bg-ink'];

export function ProductCover({
  product,
  className,
}: {
  product: PublicProduct;
  className?: string;
}) {
  if (product.coverImageUrl) {
    return (
      <img
        src={product.coverImageUrl}
        alt=""
        className={`w-full object-cover ${className ?? ''}`}
      />
    );
  }
  // Pick a steady colour per product so the grid has variety.
  const tint = COVER_TINTS[product.title.length % COVER_TINTS.length];
  return (
    <div className={`flex w-full items-end p-5 ${tint} ${className ?? ''}`}>
      <span className="font-display text-2xl font-medium leading-tight text-white [overflow-wrap:anywhere]">
        {product.title}
      </span>
    </div>
  );
}

export function ProductCard({ product, username }: { product: PublicProduct; username: string }) {
  return (
    <Link
      href={`/s/${username}/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-white shadow-soft transition-[box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:shadow-lift"
    >
      <ProductCover product={product} className="aspect-[4/3]" />
      <div className="flex flex-1 items-start justify-between gap-3 p-4">
        <div className="min-w-0">
          <h2 className="font-semibold leading-snug text-ink [overflow-wrap:anywhere]">
            {product.title}
          </h2>
          <p className="mt-1 text-[15px] font-semibold text-brand-dark">
            {formatMoney(product.priceInPaise)}
          </p>
        </div>
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line text-ink-soft transition-colors group-hover:border-ink group-hover:bg-ink group-hover:text-white">
          <ArrowUpRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}
