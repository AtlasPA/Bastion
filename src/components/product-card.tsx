import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  CONDITION_BADGE_CLASSES,
  CONDITION_CATEGORY_SLUG,
  CONDITION_LABELS,
} from "@/lib/conditions";
import { formatCents } from "@/lib/format";
import type { Prisma } from "@/generated/prisma/client";

export type ProductWithImages = Prisma.ProductGetPayload<{
  include: { images: true; category: true };
}>;

export function ProductCard({ product }: { product: ProductWithImages }) {
  const image = product.images[0];
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group rounded-lg border bg-card transition-shadow hover:shadow-md"
    >
      <div className="aspect-square overflow-hidden rounded-t-lg bg-muted p-3">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.url}
            alt={product.title}
            className="h-full w-full object-contain transition-transform group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="space-y-2 p-4">
        <h3
          className={`line-clamp-2 text-sm font-semibold leading-snug ${
            product.category.slug === CONDITION_CATEGORY_SLUG
              ? "text-brand-blue"
              : "text-brand-red"
          }`}
        >
          {product.title}
        </h3>
        <div className="flex items-center justify-between">
          <span className="font-semibold tabular-nums">
            {formatCents(product.priceCents)}
          </span>
          {product.category.slug === CONDITION_CATEGORY_SLUG && (
            <Badge className={CONDITION_BADGE_CLASSES[product.condition]}>
              {CONDITION_LABELS[product.condition]}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
