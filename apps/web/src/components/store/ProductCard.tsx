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

export function ProductCard({ product, username }: { product: PublicProduct; username: string }) {
  return (
    <Link
      href={`/s/${username}/${product.slug}`}
      className="slab group flex flex-col overflow-hidden rounded-2xl bg-white transition-transform hover:-translate-y-0.5"
    >
      {product.coverImageUrl ? (
        <img src={product.coverImageUrl} alt="" className="aspect-[4/3] w-full object-cover" />
      ) : (
        <div className="flex aspect-[4/3] w-full items-end bg-moss p-4">
          <span className="break-words font-display text-xl leading-tight text-paper">
            {product.title}
          </span>
        </div>
      )}
      <div className="flex flex-1 flex-col p-4">
        <h2 className="break-words font-display text-xl leading-snug">{product.title}</h2>
        <p className="mt-auto pt-3 text-lg font-bold">{formatMoney(product.priceInPaise)}</p>
      </div>
    </Link>
  );
}
