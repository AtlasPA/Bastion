import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { CONDITION_LABELS } from "@/lib/conditions";
import { formatCents } from "@/lib/format";
import type { Prisma } from "@/generated/prisma/client";

export type ProductWithImages = Prisma.ProductGetPayload<{
  include: { images: true };
}>;

export function ProductCard({ product }: { product: ProductWithImages }) {
  const image = product.images[0];
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group rounded-lg border bg-card transition-shadow hover:shadow-md"
    >
      <div className="aspect-square overflow-hidden rounded-t-lg bg-muted">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.url}
            alt={product.title}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : null}
      </div>
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug">
          {product.title}
        </h3>
        <div className="flex items-center justify-between">
          <span className="font-semibold tabular-nums">
            {formatCents(product.priceCents)}
          </span>
          <Badge variant="secondary">{CONDITION_LABELS[product.condition]}</Badge>
        </div>
      </div>
    </Link>
  );
}
