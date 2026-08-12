import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CONDITION_LABELS } from "@/lib/conditions";
import { formatCents } from "@/lib/format";

async function getProduct(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: { images: { orderBy: { sortOrder: "asc" } }, category: true },
  });
}

export async function generateMetadata({
  params,
}: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  return { title: product?.title ?? "Not found" };
}

export default async function ProductPage({
  params,
}: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product || product.status === "DRAFT" || product.status === "ARCHIVED") {
    notFound();
  }

  const soldOut = product.status === "SOLD" || product.quantity < 1;
  const image = product.images[0];

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div className="aspect-square overflow-hidden rounded-lg border bg-muted">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.url}
            alt={product.title}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <Link
            href={`/products?category=${product.category.slug}`}
            className="text-sm text-muted-foreground hover:underline"
          >
            {product.category.name}
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{product.title}</h1>
          <div className="flex items-center gap-3">
            <span className="text-2xl font-semibold tabular-nums">
              {formatCents(product.priceCents)}
            </span>
            <Badge variant="secondary">
              {CONDITION_LABELS[product.condition]}
            </Badge>
            {soldOut && <Badge variant="destructive">Sold out</Badge>}
          </div>
        </div>

        {product.description && (
          <p className="max-w-prose text-muted-foreground">
            {product.description}
          </p>
        )}

        <div className="space-y-2">
          <Button size="lg" disabled title="Checkout coming soon">
            Add to cart
          </Button>
          <p className="text-xs text-muted-foreground">
            Online checkout is coming soon.
          </p>
        </div>

        <dl className="grid max-w-xs grid-cols-2 gap-y-1 border-t pt-4 text-sm">
          <dt className="text-muted-foreground">SKU</dt>
          <dd className="font-mono">{product.sku}</dd>
          <dt className="text-muted-foreground">Condition</dt>
          <dd>{CONDITION_LABELS[product.condition]}</dd>
          <dt className="text-muted-foreground">In stock</dt>
          <dd>{soldOut ? 0 : product.quantity}</dd>
        </dl>
      </div>
    </div>
  );
}
