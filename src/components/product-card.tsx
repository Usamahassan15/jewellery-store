import { Link } from "@tanstack/react-router";
import { resolveImage, formatPKR } from "@/lib/format";

export type ProductCardData = {
  id: string;
  slug: string;
  name: string;
  price: number | string;
  compare_at_price: number | string | null;
  image_url: string | null;
};

export function ProductCard({ product }: { product: ProductCardData }) {
  const img = resolveImage(product.image_url);
  const price = Number(product.price);
  const compare = product.compare_at_price ? Number(product.compare_at_price) : null;
  return (
    <Link
      to="/product/$slug"
      params={{ slug: product.slug }}
      className="group flex flex-col"
    >
      <div className="relative aspect-square overflow-hidden rounded-lg bg-secondary/60">
        {img && (
          <img
            src={img}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-contain p-6 transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {compare && compare > price && (
          <span className="absolute left-3 top-3 rounded-full bg-ink px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-background">
            Sale
          </span>
        )}
      </div>
      <div className="mt-3 flex flex-col gap-1">
        <div className="font-serif text-lg leading-tight group-hover:text-gold transition-colors">{product.name}</div>
        <div className="flex items-baseline gap-2 text-sm">
          <span className="font-medium">{formatPKR(price)}</span>
          {compare && compare > price && (
            <span className="text-muted-foreground line-through">{formatPKR(compare)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
