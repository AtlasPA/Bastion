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
      {/* Branded tile: black field, wordmark on top, product floating below */}
      <div className="relative flex aspect-square flex-col items-center overflow-hidden rounded-t-lg bg-black p-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="" className="h-6 w-auto shrink-0" />
        <span aria-hidden className="absolute left-2 top-9 text-xs">
          ✨
        </span>
        <span aria-hidden className="absolute right-2 top-2 text-xs">
          ✨
        </span>
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.url}
            alt={product.title}
            className="min-h-0 w-full flex-1 object-contain pt-2 transition-transform group-hover:scale-105"
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
